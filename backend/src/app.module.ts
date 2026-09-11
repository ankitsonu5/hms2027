import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { PatientModule } from './modules/patient/patient.module';
import { OpdModule } from './modules/opd/opd.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { IpdModule } from './modules/ipd/ipd.module';
import { BillingModule } from './modules/billing/billing.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    // ── Config ────────────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // ── Database ──────────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'hmsadmin'),
        password: cfg.get('DB_PASSWORD', 'hmspassword'),
        database: cfg.get('DB_NAME', 'hms_db'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging: cfg.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
    }),

    // ── Feature modules ───────────────────────────────────────────────────────
    AuthModule,
    PatientModule,
    OpdModule,
    EmergencyModule,
    LaboratoryModule,
    IpdModule,
    BillingModule,
    PharmacyModule,
    ReportsModule,

    // ── Serve Angular build ────────────────────────────────────────────────────
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'browser'),
      // path-to-regexp v8 syntax (Express 5). The old '/api/(.*)' form throws on
      // every request, which 500'd all deep links. This excludes /api and
      // everything under it; every other path gets the Angular index.html.
      exclude: ['/api{/*splat}'],
      // No `fallthrough: false`: serve-static mounts express.static *before* its
      // index.html fallback, so with fallthrough off every non-file path such as
      // /registration was answered 404 by express.static and never reached the
      // SPA fallback.
    }),
  ],
})
export class AppModule {}
