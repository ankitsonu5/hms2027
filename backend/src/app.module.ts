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

    // ── Serve Angular build ────────────────────────────────────────────────────
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'browser'),
      exclude: ['/api/(.*)'],
      serveStaticOptions: { fallthrough: false },
    }),
  ],
})
export class AppModule {}
