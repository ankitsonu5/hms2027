import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { LabTest } from './lab-test.entity';
import { LabTestParameter } from './lab-test-parameter.entity';
import { LabReferenceRange } from './lab-reference-range.entity';
import { LabMaster } from './lab-master.entity';
import {
  CreateLabMasterDto,
  ReferenceRangeDto,
  SaveTestDefinitionDto,
  TestParameterDto,
  UpdateLabMasterDto,
} from './dto/test-definition.dto';
import { rangeText, toDays } from './lab-range.util';
import {
  STANDARD_CATEGORIES,
  STANDARD_METHODS,
  STANDARD_SAMPLE_TYPES,
  STANDARD_TESTS,
  STANDARD_UNITS,
  SeedParam,
  SeedRange,
} from './standard-tests';

const FORMULA_REF = /\{([^}]+)\}/g;
const norm = (s: string | null | undefined) => (s ?? '').trim().toUpperCase();

@Injectable()
export class TestMasterService implements OnApplicationBootstrap {
  private readonly log = new Logger(TestMasterService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(LabTest) private readonly testRepo: Repository<LabTest>,
    @InjectRepository(LabTestParameter)
    private readonly paramRepo: Repository<LabTestParameter>,
    @InjectRepository(LabMaster)
    private readonly masterRepo: Repository<LabMaster>,
  ) {}

  // ── Masters (units, sample types, categories, methods…) ─────────────────────

  listMasters(tenantId: string, kind?: string) {
    return this.masterRepo.find({
      where: { tenantId, isActive: true, ...(kind ? { kind } : {}) },
      order: { kind: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async createMaster(tenantId: string, dto: CreateLabMasterDto) {
    const name = dto.name.trim();
    const existing = await this.masterRepo
      .createQueryBuilder('m')
      .where(
        'm.tenantId = :tenantId AND m.kind = :kind AND LOWER(m.name) = LOWER(:name)',
        {
          tenantId,
          kind: dto.kind,
          name,
        },
      )
      .getOne();
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        return this.masterRepo.save(existing);
      }
      return existing;
    }
    return this.masterRepo.save(
      this.masterRepo.create({
        tenantId,
        kind: dto.kind,
        name,
        sortOrder: dto.sortOrder ?? 100,
      }),
    );
  }

  async updateMaster(tenantId: string, id: string, dto: UpdateLabMasterDto) {
    const m = await this.masterRepo.findOne({ where: { id, tenantId } });
    if (!m) throw new NotFoundException('Master entry not found');
    Object.assign(m, { ...dto, name: dto.name?.trim() ?? m.name });
    return this.masterRepo.save(m);
  }

  async removeMaster(tenantId: string, id: string) {
    const m = await this.masterRepo.findOne({ where: { id, tenantId } });
    if (!m) throw new NotFoundException('Master entry not found');
    m.isActive = false;
    await this.masterRepo.save(m);
  }

  // ── Test definitions ───────────────────────────────────────────────────────

  async getDefinition(tenantId: string, id: string) {
    const test = await this.testRepo.findOne({ where: { id, tenantId } });
    if (!test) throw new NotFoundException(`Lab test ${id} not found`);
    test.parameters = await this.loadParameters(tenantId, [id]);
    const panelTests = test.panelTestIds?.length
      ? await this.testRepo.find({
          where: { tenantId, id: In(test.panelTestIds) },
          select: { id: true, name: true, code: true, category: true, testType: true, price: true },
        })
      : [];
    const byId = new Map(panelTests.map((t) => [t.id, t]));
    return {
      ...test,
      panelTests: (test.panelTestIds ?? [])
        .map((pid) => byId.get(pid))
        .filter(Boolean),
    };
  }

  /** Parameters (with ranges) for several tests, in print order. */
  async loadParameters(
    tenantId: string,
    testIds: string[],
  ): Promise<LabTestParameter[]> {
    if (!testIds.length) return [];
    const params = await this.paramRepo.find({
      where: { tenantId, testId: In(testIds) },
      order: { sortOrder: 'ASC' },
    });
    for (const p of params)
      p.ranges = (p.ranges ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
    return params;
  }

  async createDefinition(tenantId: string, dto: SaveTestDefinitionDto) {
    const id = await this.dataSource.transaction(async (em) => {
      await this.assertUniqueName(em, tenantId, dto.name);
      const test = em.create(LabTest, { tenantId, isActive: true });
      this.applyTestFields(test, dto);
      const saved = await em.save(test);
      await this.writeParameters(em, tenantId, saved, dto);
      return saved.id;
    });
    return this.getDefinition(tenantId, id);
  }

  async updateDefinition(
    tenantId: string,
    id: string,
    dto: SaveTestDefinitionDto,
  ) {
    await this.dataSource.transaction(async (em) => {
      const test = await em.findOne(LabTest, { where: { id, tenantId } });
      if (!test) throw new NotFoundException(`Lab test ${id} not found`);
      await this.assertUniqueName(em, tenantId, dto.name, id);
      this.applyTestFields(test, dto);
      await em.save(test);
      await this.writeParameters(em, tenantId, test, dto);
    });
    return this.getDefinition(tenantId, id);
  }

  /** Replace the normal values of a single parameter (Normal Value Editor). */
  async saveRanges(
    tenantId: string,
    parameterId: string,
    ranges: ReferenceRangeDto[],
  ) {
    const param = await this.paramRepo.findOne({
      where: { id: parameterId, tenantId },
    });
    if (!param) throw new NotFoundException('Parameter not found');
    await this.dataSource.transaction(async (em) => {
      await em.delete(LabReferenceRange, { tenantId, parameterId });
      await em.save(
        ranges.map((r, i) => this.buildRange(em, tenantId, parameterId, r, i)),
      );
      if (param.sortOrder === 1) {
        const first = ranges[0];
        await em.update(
          LabTest,
          { id: param.testId, tenantId },
          { normalRange: first ? rangeText(first as any) : (null as any) },
        );
      }
    });
    return this.getDefinition(tenantId, param.testId);
  }

  async duplicateDefinition(tenantId: string, id: string) {
    const src = await this.getDefinition(tenantId, id);
    let name = `${src.name} (COPY)`;
    for (
      let i = 2;
      await this.nameTaken(this.dataSource.manager, tenantId, name);
      i++
    )
      name = `${src.name} (COPY ${i})`;
    const dto: SaveTestDefinitionDto = {
      ...this.pickTestFields(src),
      name,
      code: src.code ? `${src.code}-COPY` : undefined,
      parameters: src.parameters.map((p) => ({
        ...p,
        id: undefined,
        ranges: p.ranges.map((r) => ({ ...r, id: undefined })),
      })) as any,
    };
    return this.createDefinition(tenantId, dto);
  }

  private pickTestFields(t: LabTest): SaveTestDefinitionDto {
    return {
      name: t.name,
      code: t.code ?? undefined,
      category: t.category,
      testType: t.testType,
      price: Number(t.price),
      sampleType: t.sampleType ?? undefined,
      method: t.method ?? undefined,
      instrument: t.instrument ?? undefined,
      shortText: t.shortText ?? undefined,
      testAlias: t.testAlias ?? undefined,
      loincCode: t.loincCode ?? undefined,
      integrationCode: t.integrationCode ?? undefined,
      isOutsourced: t.isOutsourced,
      outsourceCenter: t.outsourceCenter ?? undefined,
      interpretation: t.interpretation ?? undefined,
      printOnNewPage: t.printOnNewPage,
      panelTestIds: t.panelTestIds ?? undefined,
    };
  }

  private applyTestFields(test: LabTest, dto: SaveTestDefinitionDto) {
    Object.assign(test, {
      name: dto.name.trim(),
      code: dto.code?.trim() || null,
      category: norm(dto.category),
      testType: dto.testType,
      price: dto.price,
      sampleType: dto.sampleType?.trim() || null,
      method: dto.method?.trim() || null,
      instrument: dto.instrument?.trim() || null,
      shortText: dto.shortText?.trim() || null,
      testAlias: dto.testAlias?.trim() || null,
      loincCode: dto.loincCode?.trim() || null,
      integrationCode: dto.integrationCode?.trim() || null,
      isOutsourced: !!dto.isOutsourced,
      outsourceCenter: dto.isOutsourced
        ? dto.outsourceCenter?.trim() || null
        : null,
      interpretation: dto.interpretation?.trim() || null,
      printOnNewPage: !!dto.printOnNewPage,
      panelTestIds: dto.testType === 'PANEL' ? (dto.panelTestIds ?? []) : null,
    });
  }

  private async nameTaken(
    em: EntityManager,
    tenantId: string,
    name: string,
    exceptId?: string,
  ) {
    const qb = em
      .createQueryBuilder(LabTest, 't')
      .where(
        't.tenantId = :tenantId AND t.isActive = true AND LOWER(TRIM(t.name)) = LOWER(TRIM(:name))',
        { tenantId, name },
      );
    if (exceptId) qb.andWhere('t.id <> :exceptId', { exceptId });
    return (await qb.getCount()) > 0;
  }

  private async assertUniqueName(
    em: EntityManager,
    tenantId: string,
    name: string,
    exceptId?: string,
  ) {
    if (await this.nameTaken(em, tenantId, name, exceptId)) {
      throw new ConflictException(
        `A test named "${name.trim()}" already exists`,
      );
    }
  }

  /** Validates the parameter list for the test type, then replaces it (keeping ids that were sent). */
  private async writeParameters(
    em: EntityManager,
    tenantId: string,
    test: LabTest,
    dto: SaveTestDefinitionDto,
  ) {
    let params = (dto.parameters ?? []).filter((p) => p.name?.trim());

    switch (dto.testType) {
      case 'PANEL':
        if (!dto.panelTestIds?.length)
          throw new BadRequestException(
            'A panel must include at least one test',
          );
        if (dto.panelTestIds.includes(test.id))
          throw new BadRequestException('A panel cannot include itself');
        params = [];
        break;
      case 'BILL_ONLY':
        params = [];
        break;
      case 'SINGLE':
        if (!params.length)
          params = [
            { name: test.name, inputType: 'NUMERIC', resultType: 'MANUAL' },
          ];
        params = params.slice(0, 1);
        break;
      case 'DOCUMENT':
        if (!params.length)
          params = [
            { name: 'REPORT', inputType: 'PARAGRAPH', resultType: 'FIXED' },
          ];
        params = [{ ...params[0], inputType: 'PARAGRAPH' }];
        break;
      default:
        if (!params.length)
          throw new BadRequestException('Add at least one parameter');
        if (dto.testType === 'NESTED') {
          const missing = params.find((p) => !p.groupBy?.trim());
          if (missing)
            throw new BadRequestException(
              `Parameter "${missing.name}" needs a group (sub-heading)`,
            );
        }
    }

    const names = new Set<string>();
    for (const p of params) {
      const key = norm(p.name);
      if (names.has(key))
        throw new BadRequestException(`Parameter "${p.name}" is listed twice`);
      names.add(key);
    }
    for (const p of params) {
      if (p.resultType !== 'FORMULA') continue;
      if (!p.formula?.trim())
        throw new BadRequestException(`Parameter "${p.name}" needs a formula`);
      for (const m of p.formula.matchAll(FORMULA_REF)) {
        if (!names.has(norm(m[1]))) {
          throw new BadRequestException(
            `Formula of "${p.name}" refers to unknown parameter {${m[1]}}`,
          );
        }
      }
    }

    const existing = await em.find(LabTestParameter, {
      where: { tenantId, testId: test.id },
    });
    const keepIds = new Set(
      params
        .map((p) => p.id)
        .filter((id) => id && existing.some((e) => e.id === id)),
    );
    const dropIds = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);
    if (existing.length) {
      await em.delete(LabReferenceRange, {
        tenantId,
        parameterId: In(existing.map((e) => e.id)),
      });
    }
    if (dropIds.length)
      await em.delete(LabTestParameter, { tenantId, id: In(dropIds) });

    for (const [i, p] of params.entries()) {
      const row = em.create(
        LabTestParameter,
        this.buildParam(tenantId, test.id, p, i),
      );
      const saved = await em.save(row);
      if (p.ranges?.length) {
        await em.save(
          p.ranges.map((r, j) => this.buildRange(em, tenantId, saved.id, r, j)),
        );
      }
    }

    // Keep the summary columns used by the order form and older screens.
    const first = params[0];
    await em.update(
      LabTest,
      { id: test.id, tenantId },
      {
        unit: first?.unit?.trim() || (null as any),
        normalRange: first?.ranges?.length
          ? rangeText(first.ranges[0] as any)
          : (null as any),
      },
    );
  }

  private buildParam(
    tenantId: string,
    testId: string,
    p: TestParameterDto,
    index: number,
  ): Partial<LabTestParameter> {
    const resultType = p.resultType ?? 'MANUAL';
    const options = (p.options ?? []).map((o) => o.trim()).filter(Boolean);
    return {
      ...(p.id ? { id: p.id } : {}),
      tenantId,
      testId,
      sortOrder: index + 1,
      name: p.name.trim(),
      unit: p.unit?.trim() || (null as any),
      method: p.method?.trim() || (null as any),
      inputType: p.inputType ?? 'NUMERIC',
      resultType,
      options: options.length ? options : null,
      normalOptions: (p.normalOptions ?? []).filter((o) => options.includes(o))
        .length
        ? (p.normalOptions ?? []).filter((o) => options.includes(o))
        : null,
      defaultResult:
        resultType === 'FORMULA'
          ? (null as any)
          : p.defaultResult?.trim() || (null as any),
      formula: resultType === 'FORMULA' ? p.formula?.trim() : (null as any),
      decimals: p.decimals ?? null,
      groupBy: p.groupBy?.trim() ? norm(p.groupBy) : (null as any),
      isOptional: !!p.isOptional,
      isBold: !!p.isBold,
    };
  }

  private buildRange(
    em: EntityManager,
    tenantId: string,
    parameterId: string,
    r: ReferenceRangeDto,
    index: number,
  ) {
    const minAge = r.minAge ?? 0;
    const minAgeUnit = r.minAgeUnit ?? 'YEARS';
    const maxAge = r.maxAge ?? 120;
    const maxAgeUnit = r.maxAgeUnit ?? 'YEARS';
    const minDays = toDays(minAge, minAgeUnit);
    const maxDays = toDays(maxAge, maxAgeUnit);
    if (maxDays < minDays)
      throw new BadRequestException(
        'Normal value: max age must be greater than min age',
      );
    if (
      r.lowerValue != null &&
      r.upperValue != null &&
      r.lowerValue > r.upperValue
    ) {
      throw new BadRequestException(
        'Normal value: lower value must not exceed upper value',
      );
    }
    return em.create(LabReferenceRange, {
      tenantId,
      parameterId,
      sortOrder: index + 1,
      rangeType: r.rangeType ?? 'NUMERIC',
      gender: r.gender ?? 'ANY',
      minAge,
      minAgeUnit,
      maxAge,
      maxAgeUnit,
      minDays,
      maxDays,
      lowerValue: r.lowerValue ?? null,
      upperValue: r.upperValue ?? null,
      criticalLow: r.criticalLow ?? null,
      criticalHigh: r.criticalHigh ?? null,
      textValue: r.textValue?.trim() || (null as any),
      displayText: r.displayText?.trim() || (null as any),
      remark: r.remark?.trim() || (null as any),
    });
  }

  // ── Standard library ───────────────────────────────────────────────────────

  /** Loads the starter masters and tests; anything that already exists (same code or name) is skipped. */
  async seedStandard(tenantId: string) {
    const lists: [string, string[]][] = [
      ['CATEGORY', STANDARD_CATEGORIES],
      ['UNIT', STANDARD_UNITS],
      ['SAMPLE_TYPE', STANDARD_SAMPLE_TYPES],
      ['METHOD', STANDARD_METHODS],
    ];
    for (const [kind, names] of lists) {
      for (const [i, name] of names.entries())
        await this.createMaster(tenantId, {
          kind,
          name,
          sortOrder: (i + 1) * 10,
        });
    }

    const existing = await this.testRepo.find({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, code: true },
    });
    const byCode = new Map(
      existing.filter((t) => t.code).map((t) => [norm(t.code), t.id]),
    );
    const byName = new Map(existing.map((t) => [norm(t.name), t.id]));
    const created: string[] = [];
    const skipped: string[] = [];

    for (const s of STANDARD_TESTS) {
      if (byCode.has(norm(s.code)) || byName.has(norm(s.name))) {
        skipped.push(s.name);
        continue;
      }
      const dto: SaveTestDefinitionDto = {
        name: s.name,
        code: s.code,
        category: s.category,
        testType: s.type,
        price: s.price,
        sampleType: s.sample,
        method: s.method,
        instrument: s.instrument,
        interpretation: s.interpretation,
        panelTestIds: s.panelCodes
          ?.map((c) => byCode.get(norm(c)))
          .filter((x): x is string => !!x),
        parameters: (s.params ?? []).map((p) => this.seedParam(p)),
      };
      const t = await this.createDefinition(tenantId, dto);
      byCode.set(norm(s.code), t.id);
      byName.set(norm(s.name), t.id);
      created.push(s.name);
    }
    return { created, skipped };
  }

  private seedParam(p: SeedParam): TestParameterDto {
    return {
      name: p.name,
      unit: p.unit,
      method: p.method,
      groupBy: p.group,
      inputType: p.input ?? 'NUMERIC',
      resultType: p.result ?? 'MANUAL',
      options: p.options,
      normalOptions: p.normal,
      defaultResult: p.def,
      formula: p.formula,
      decimals: p.decimals,
      isOptional: p.optional,
      isBold: p.bold,
      ranges: (p.ranges ?? []).map((r: SeedRange) => ({
        rangeType: r.text != null ? 'TEXT' : 'NUMERIC',
        gender: r.gender ?? 'ANY',
        minAge: r.minAge ?? 0,
        minAgeUnit: r.minAgeUnit ?? 'YEARS',
        maxAge: r.maxAge ?? 120,
        maxAgeUnit: r.maxAgeUnit ?? 'YEARS',
        lowerValue: r.low ?? null,
        upperValue: r.high ?? null,
        criticalLow: r.critLow ?? null,
        criticalHigh: r.critHigh ?? null,
        textValue: r.text,
        displayText: r.display,
        remark: r.remark,
      })),
    };
  }

  // ── One-time conversion of the first-version data ──────────────────────────

  async onApplicationBootstrap() {
    try {
      await this.convertLegacyTests();
    } catch (e) {
      this.log.error(
        `Legacy lab test conversion failed: ${(e as Error).message}`,
      );
    }
  }

  /**
   * The first test builder saved parameters as an untyped JSON blob and used
   * testType TEST / PROFILE. Convert those rows to the structured model once.
   */
  private async convertLegacyTests() {
    const rows: any[] = await this.dataSource.query(
      `SELECT t.id, t."tenantId", t.name, t.category, t."testType", t.unit, t."normalRange", t.method, t.parameters
         FROM lab_tests t
        WHERE t."testType" IN ('TEST', 'PROFILE')
           OR (t."testType" NOT IN ('PANEL', 'BILL_ONLY')
               AND NOT EXISTS (SELECT 1 FROM lab_test_parameters p WHERE p."testId" = t.id))`,
    );
    if (!rows.length) return;

    for (const row of rows) {
      await this.dataSource.transaction(async (em) => {
        const legacy: any[] = Array.isArray(row.parameters)
          ? row.parameters
          : [];
        const hasRows = await em.count(LabTestParameter, {
          where: { testId: row.id },
        });
        let group: string | undefined;
        const params: TestParameterDto[] = [];
        for (const lp of legacy) {
          const type = String(lp?.type ?? '');
          if (type === 'Heading') {
            group = lp.name?.trim() || undefined;
            continue;
          }
          if (
            ['Separator', 'Page Break', 'Space'].includes(type) ||
            !lp?.name?.trim()
          )
            continue;
          params.push({
            name: String(lp.name).trim(),
            unit: lp.unit || undefined,
            method: lp.method || undefined,
            groupBy: group,
            inputType: type.startsWith('Descriptive') ? 'TEXT' : 'NUMERIC',
            resultType: type === 'List Field' ? 'DROPDOWN' : 'MANUAL',
          });
        }

        let testType = row.testType;
        if (testType === 'PROFILE') testType = 'PANEL';
        if (testType === 'TEST') {
          testType =
            params.length > 1
              ? params.some((p) => p.groupBy)
                ? 'NESTED'
                : 'MULTIPLE'
              : 'SINGLE';
        }
        if (testType === 'NESTED')
          params.forEach((p) => (p.groupBy = p.groupBy || 'GENERAL'));

        if (!hasRows && testType !== 'PANEL' && testType !== 'BILL_ONLY') {
          if (!params.length) {
            params.push({
              name: row.name,
              unit: row.unit || undefined,
              method: row.method || undefined,
              ranges: this.parseRange(row.normalRange),
            });
          } else if (testType === 'SINGLE' && row.normalRange) {
            params[0].ranges = this.parseRange(row.normalRange);
          }
          const test = { id: row.id } as LabTest;
          for (const [i, p] of params.entries()) {
            const saved = await em.save(
              LabTestParameter,
              em.create(
                LabTestParameter,
                this.buildParam(row.tenantId, test.id, p, i),
              ),
            );
            if (p.ranges?.length)
              await em.save(
                p.ranges.map((r, j) =>
                  this.buildRange(em, row.tenantId, saved.id, r, j),
                ),
              );
          }
        }
        await em.update(LabTest, { id: row.id }, { testType, category: norm(row.category) || 'GENERAL' });
      });
    }
    this.log.log(
      `Converted ${rows.length} legacy lab test(s) to the structured parameter model`,
    );
  }

  /** "13 - 17", "13-17", "<200", ">40" or free text → one range. */
  private parseRange(text: string | null): ReferenceRangeDto[] | undefined {
    const t = (text ?? '').trim();
    if (!t) return undefined;
    let m = t.match(/^([-+]?\d*\.?\d+)\s*[-–]\s*([-+]?\d*\.?\d+)$/);
    if (m) return [{ lowerValue: +m[1], upperValue: +m[2] }];
    m = t.match(/^<\s*=?\s*([-+]?\d*\.?\d+)$/);
    if (m) return [{ upperValue: +m[1] }];
    m = t.match(/^>\s*=?\s*([-+]?\d*\.?\d+)$/);
    if (m) return [{ lowerValue: +m[1] }];
    return [{ rangeType: 'TEXT', textValue: t }];
  }
}
