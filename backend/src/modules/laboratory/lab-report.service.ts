import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LabOrder } from './lab-order.entity';
import { LabResult } from './lab-result.entity';
import { LabTest } from './lab-test.entity';
import { LabMaster } from './lab-master.entity';
import { LabReportSetting } from './lab-report-setting.entity';
import { LabTestParameter } from './lab-test-parameter.entity';
import { LabReferenceRange } from './lab-reference-range.entity';
import { Patient } from '../patient/patient.entity';
import { TestMasterService } from './test-master.service';
import {
  SaveOrderResultsDto,
  UpdateReportSettingsDto,
} from './dto/lab-report.dto';
import {
  flagValue,
  isAbnormalFlag,
  pickRange,
  rangeText,
} from './lab-range.util';

export interface WorksheetParameter {
  parameterId: string | null;
  name: string;
  unit: string | null;
  method: string | null;
  inputType: string;
  resultType: string;
  options: string[] | null;
  normalOptions: string[] | null;
  defaultResult: string | null;
  formula: string | null;
  decimals: number | null;
  groupBy: string | null;
  isOptional: boolean;
  isBold: boolean;
  range: Partial<LabReferenceRange> | null;
  rangeText: string;
  remark: string | null;
  value: string | null;
  flag: string | null;
  hideInPrint: boolean;
  saved: boolean;
}

export interface WorksheetTest {
  testId: string;
  testName: string;
  code: string | null;
  category: string;
  categoryOrder: number;
  testType: string;
  method: string | null;
  sampleType: string | null;
  isOutsourced: boolean;
  outsourceCenter: string | null;
  interpretation: string | null;
  printOnNewPage: boolean;
  panelName: string | null;
  reportUrl: string | null;
  parameters: WorksheetParameter[];
}

type AuthUser = { id?: string; name?: string } | undefined;

@Injectable()
export class LabReportService {
  constructor(
    @InjectRepository(LabOrder)
    private readonly orderRepo: Repository<LabOrder>,
    @InjectRepository(LabResult)
    private readonly resultRepo: Repository<LabResult>,
    @InjectRepository(LabTest) private readonly testRepo: Repository<LabTest>,
    @InjectRepository(LabMaster)
    private readonly masterRepo: Repository<LabMaster>,
    @InjectRepository(LabReportSetting)
    private readonly settingRepo: Repository<LabReportSetting>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    private readonly testMaster: TestMasterService,
  ) {}

  // ── Worksheet: everything result entry and the printed report need ─────────

  async worksheet(tenantId: string, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, tenantId, isActive: true },
    });
    if (!order) throw new NotFoundException(`Lab order ${orderId} not found`);

    const patient = await this.patientRepo.findOne({
      where: { id: order.patientId, tenantId },
    });
    const ageDays = patient?.dob
      ? this.daysBetween(patient.dob, order.createdAt)
      : null;

    // Older orders stored plain test ids; newer ones store { testId, testName, price }.
    const orderTests = ((order.tests ?? []) as any[]).map((x) =>
      typeof x === 'string'
        ? { testId: x, testName: '', price: 0 }
        : { ...x, testId: x.testId ?? x.id, testName: x.testName ?? x.name ?? '' },
    );

    // Load ordered tests, then the members of any panels.
    const orderedIds = orderTests.map((t) => t.testId).filter(Boolean);
    const ordered = orderedIds.length
      ? await this.testRepo.find({ where: { tenantId, id: In(orderedIds) } })
      : [];
    const memberIds = ordered.flatMap((t) =>
      t.testType === 'PANEL' ? (t.panelTestIds ?? []) : [],
    );
    const members = memberIds.length
      ? await this.testRepo.find({ where: { tenantId, id: In(memberIds) } })
      : [];
    const byId = new Map([...ordered, ...members].map((t) => [t.id, t]));

    // Flatten into report lines: [test, panel name] in order, no duplicates.
    const lines: {
      testId: string;
      name: string;
      test?: LabTest;
      panelName: string | null;
    }[] = [];
    const seen = new Set<string>();
    for (const ot of orderTests) {
      const t = byId.get(ot.testId);
      if (t?.testType === 'PANEL') {
        for (const mid of t.panelTestIds ?? []) {
          const m = byId.get(mid);
          if (!m || seen.has(mid)) continue;
          seen.add(mid);
          lines.push({ testId: mid, name: m.name, test: m, panelName: t.name });
        }
      } else if (!seen.has(ot.testId)) {
        seen.add(ot.testId);
        lines.push({
          testId: ot.testId,
          name: t?.name ?? ot.testName,
          test: t,
          panelName: null,
        });
      }
    }

    const params = await this.testMaster.loadParameters(
      tenantId,
      lines.map((l) => l.testId),
    );
    const paramsByTest = new Map<string, LabTestParameter[]>();
    for (const p of params) {
      if (!paramsByTest.has(p.testId)) paramsByTest.set(p.testId, []);
      paramsByTest.get(p.testId)!.push(p);
    }

    const results = await this.resultRepo.find({
      where: { tenantId, orderId, isActive: true },
    });
    const resultKey = (testId: string, parameterId: string | null) =>
      `${testId}|${parameterId ?? ''}`;
    const resultMap = new Map(
      results.map((r) => [resultKey(r.testId, r.parameterId ?? null), r]),
    );

    const categories = await this.masterRepo.find({
      where: { tenantId, kind: 'CATEGORY', isActive: true },
    });
    const catOrder = new Map(
      categories.map((c) => [c.name.trim().toUpperCase(), c.sortOrder]),
    );

    const tests: WorksheetTest[] = lines.map((line, idx) => {
      const t = line.test;
      const category = (t?.category || 'GENERAL').trim().toUpperCase();
      let defs = paramsByTest.get(line.testId) ?? [];
      // A test without parameter rows (old data or deleted master) still gets one entry line.
      const synthetic = !defs.length && t?.testType !== 'BILL_ONLY';
      const outParams: WorksheetParameter[] = synthetic
        ? [
            this.syntheticParam(
              line.name,
              t,
              resultMap.get(resultKey(line.testId, null)),
            ),
          ]
        : defs.map((p) => {
            const range = pickRange(p.ranges, ageDays, patient?.gender);
            const r = resultMap.get(resultKey(line.testId, p.id));
            return {
              parameterId: p.id,
              name: p.name,
              unit: p.unit ?? null,
              method: p.method || t?.method || null,
              inputType: p.inputType,
              resultType: p.resultType,
              options: p.options,
              normalOptions: p.normalOptions,
              defaultResult: p.defaultResult ?? null,
              formula: p.formula ?? null,
              decimals: p.decimals,
              groupBy: p.groupBy ?? null,
              isOptional: p.isOptional,
              isBold: p.isBold,
              range: range ? this.publicRange(range) : null,
              rangeText: rangeText(range),
              remark: range?.remark ?? null,
              value: r?.value ?? null,
              flag: r?.flag ?? null,
              hideInPrint: r?.hideInPrint ?? false,
              saved: !!r,
            };
          });
      const reportUrl =
        results.find((r) => r.testId === line.testId && r.reportUrl)
          ?.reportUrl ?? null;
      return {
        testId: line.testId,
        testName: line.name,
        code: t?.code ?? null,
        category,
        categoryOrder: (catOrder.get(category) ?? 1000) * 1000 + idx,
        testType: t?.testType ?? 'SINGLE',
        method: t?.method ?? null,
        sampleType: t?.sampleType ?? null,
        isOutsourced: !!t?.isOutsourced,
        outsourceCenter: t?.outsourceCenter ?? null,
        interpretation: t?.interpretation ?? null,
        printOnNewPage: !!t?.printOnNewPage,
        panelName: line.panelName,
        reportUrl,
        parameters: outParams,
      };
    });
    tests.sort((a, b) => a.categoryOrder - b.categoryOrder);

    return {
      order: {
        id: order.id,
        labNo: order.labNo,
        status: order.status,
        createdAt: order.createdAt,
        sampleCollectedAt: order.sampleCollectedAt,
        sampleBarcode: order.sampleBarcode,
        orderedByDoctorName: order.orderedByDoctorName,
        sponsorName: order.sponsorName,
        patientCategory: order.patientCategory,
        resultEnteredAt: order.resultEnteredAt,
        resultEnteredByName: order.resultEnteredByName,
        approvedAt: order.approvedAt,
        approvedByName: order.approvedByName,
        printCount: order.printCount,
      },
      patient: patient
        ? {
            id: patient.id,
            name: `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim(),
            uhid: patient.uhid,
            gender: patient.gender,
            dob: patient.dob,
            phone: patient.phone,
            ageDays,
            ageText: this.ageText(ageDays),
            referredByDoctorName: patient.referredByDoctorName,
          }
        : null,
      tests,
    };
  }

  private syntheticParam(
    name: string,
    t: LabTest | undefined,
    r: LabResult | undefined,
  ): WorksheetParameter {
    return {
      parameterId: null,
      name,
      unit: t?.unit ?? r?.unit ?? null,
      method: t?.method ?? null,
      inputType: 'TEXT',
      resultType: 'MANUAL',
      options: null,
      normalOptions: null,
      defaultResult: null,
      formula: null,
      decimals: null,
      groupBy: null,
      isOptional: false,
      isBold: false,
      range: null,
      rangeText: t?.normalRange ?? r?.normalRange ?? '',
      remark: null,
      value: r?.value ?? null,
      flag: r?.flag ?? (r?.isAbnormal ? 'ABNORMAL' : null),
      hideInPrint: r?.hideInPrint ?? false,
      saved: !!r,
    };
  }

  private publicRange(r: LabReferenceRange) {
    const { tenantId, parameter, parameterId, ...rest } = r as any;
    return rest;
  }

  private daysBetween(dob: string | Date, at: Date): number | null {
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    return Math.max(
      0,
      Math.floor(
        ((at ? new Date(at) : new Date()).getTime() - d.getTime()) / 86_400_000,
      ),
    );
  }

  private ageText(days: number | null): string {
    if (days == null) return '';
    if (days >= 365) return `${Math.floor(days / 365.25)} Y`;
    if (days >= 30) return `${Math.floor(days / 30)} M`;
    return `${days} D`;
  }

  // ── Save results ───────────────────────────────────────────────────────────

  async saveResults(
    tenantId: string,
    orderId: string,
    dto: SaveOrderResultsDto,
    user: AuthUser,
  ) {
    const ws = await this.worksheet(tenantId, orderId);
    const lookup = new Map<
      string,
      { test: WorksheetTest; param: WorksheetParameter }
    >();
    for (const test of ws.tests)
      for (const param of test.parameters)
        lookup.set(`${test.testId}|${param.parameterId ?? ''}`, {
          test,
          param,
        });

    const existing = await this.resultRepo.find({
      where: { tenantId, orderId },
    });
    const existingMap = new Map(
      existing.map((r) => [`${r.testId}|${r.parameterId ?? ''}`, r]),
    );
    let changed = false;

    for (const [i, entry] of dto.results.entries()) {
      const key = `${entry.testId}|${entry.parameterId ?? ''}`;
      const hit = lookup.get(key);
      if (!hit)
        throw new BadRequestException(
          `Result ${i + 1} does not belong to this order`,
        );
      const { test, param } = hit;
      const value = (entry.value ?? '').trim();
      const row = existingMap.get(key);

      if (!value) {
        if (row) {
          await this.resultRepo.delete({ id: row.id });
          changed = true;
        }
        continue;
      }

      const flag = param.parameterId
        ? flagValue(value, param.range as any, param.normalOptions)
        : (row?.flag as any) || '';
      const next = {
        tenantId,
        orderId,
        testId: test.testId,
        testName: test.testName,
        parameterId: param.parameterId as any,
        parameterName: param.name,
        groupBy: param.groupBy as any,
        sortOrder: test.parameters.indexOf(param) + 1,
        value,
        unit: param.unit as any,
        normalRange: param.rangeText || (null as any),
        method: param.method as any,
        remark: param.remark as any,
        flag: flag || (null as any),
        isAbnormal: isAbnormalFlag(flag),
        hideInPrint: !!entry.hideInPrint,
        enteredById: user?.id as any,
        isActive: true,
      };
      if (row) {
        if (row.value !== value || row.hideInPrint !== !!entry.hideInPrint)
          changed = true;
        Object.assign(row, next);
        await this.resultRepo.save(row);
      } else {
        changed = true;
        await this.resultRepo.save(this.resultRepo.create(next));
      }
    }

    const order = await this.orderRepo.findOneOrFail({
      where: { id: orderId, tenantId },
    });
    const fresh = await this.worksheet(tenantId, orderId);
    const required = fresh.tests
      .filter((t) => !t.isOutsourced)
      .flatMap((t) =>
        t.parameters.filter((p) => !p.isOptional && p.resultType !== 'FORMULA'),
      );
    const outsourcedPending = fresh.tests.some(
      (t) => t.isOutsourced && !t.reportUrl,
    );
    const anyValue = fresh.tests.some((t) => t.parameters.some((p) => p.saved));
    const allDone = required.every((p) => p.saved) && !outsourcedPending;

    order.status = allDone
      ? 'COMPLETED'
      : anyValue
        ? 'IN_PROGRESS'
        : order.status;
    order.resultEnteredAt = new Date();
    order.resultEnteredByName = user?.name ?? order.resultEnteredByName;
    if (dto.approve) {
      order.approvedAt = new Date();
      order.approvedByName = user?.name ?? 'Pathologist';
    } else if (changed && order.approvedAt) {
      // Edited after approval: needs approving again.
      order.approvedAt = null;
      order.approvedByName = null;
    }
    await this.orderRepo.save(order);
    return this.worksheet(tenantId, orderId);
  }

  async setApproval(
    tenantId: string,
    orderId: string,
    approve: boolean,
    user: AuthUser,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, tenantId, isActive: true },
    });
    if (!order) throw new NotFoundException(`Lab order ${orderId} not found`);
    order.approvedAt = approve ? new Date() : null;
    order.approvedByName = approve ? (user?.name ?? 'Pathologist') : null;
    await this.orderRepo.save(order);
    return {
      approvedAt: order.approvedAt,
      approvedByName: order.approvedByName,
    };
  }

  async markPrinted(tenantId: string, orderId: string) {
    await this.orderRepo.increment({ id: orderId, tenantId }, 'printCount', 1);
    return { ok: true };
  }

  // ── Report settings ────────────────────────────────────────────────────────

  async getSettings(tenantId: string): Promise<LabReportSetting> {
    let s = await this.settingRepo.findOne({ where: { tenantId } });
    if (!s) {
      s = await this.settingRepo.save(
        this.settingRepo.create({
          tenantId,
          headerImage: '/access-pathlab-header.jpeg',
          headerHeightMm: 38,
          footerHeightMm: 18,
          letterheadByDefault: true,
          labName: 'Access Path Lab India Pvt Ltd',
          labAddress:
            '14-37-41/2, Beside Sri Sathya IVF, Krishna Nagar, Visakhapatnam',
          labContact: 'Ph: 9618135999 | accesspathlabs@gmail.com',
          signatures: [
            { name: 'Lab Technologist', designation: 'DMLT' },
            {
              name: 'Dr. Krishna Prasad',
              designation: 'Consultant Pathologist',
              imageUrl: '/access-pathlab-signature.jpeg',
            },
          ],
          footerNotes:
            'Not valid for medico-legal purpose.\nPlease correlate clinically.',
        }),
      );
    }
    return s;
  }

  async updateSettings(tenantId: string, dto: UpdateReportSettingsDto) {
    const s = await this.getSettings(tenantId);
    Object.assign(s, dto);
    return this.settingRepo.save(s);
  }
}
