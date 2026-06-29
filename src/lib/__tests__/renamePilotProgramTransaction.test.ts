import { writeActivePilotProgram } from '../../config/activePilotProgram';
import {
  readActiveAccessCode,
  writeActiveAccessCode,
  writeActiveFamilyContext,
  writeActivePortalRole,
} from '../../config/portalContext';
import { writeLastPilotProgram, readLastPilotProgramForRole } from '../../config/lastPilotProgram';
import type { ActivePilotProgram } from '../../types/pilotProgram';
import {
  readRememberedDeviceSession,
  writeRememberedDeviceSession,
} from '../rememberedDeviceSession';
import {
  readRememberedProgramAccessRecord,
  writeRememberedProgramAccess,
} from '../rememberedProgramAccess';
import {
  __setRenamePilotProgramRpcClientForTests,
  renamePilotProgramTransaction,
} from '../renamePilotProgramTransaction';

const mockedRpc = jest.fn();

const baseProgram: ActivePilotProgram = {
  id: 'program-1',
  programName: 'GDI Camp',
  programCode: 'CAMP-BLUERIBBON-2026',
  programType: 'Camp / Youth Program',
  adminFirstName: 'Breonna',
  adminEmail: 'Breonna.stills@yahoo.com',
  estimatedStudents: 1,
  ageRange: 'Mixed Ages',
  groupName: 'Morning Group',
  familyAccessCode: 'CAMP-BLUERIBBON-2026-FAMILY',
  facilitatorAccessCode: 'FAC-BLUERIBBON-2026',
  pricingTier: 'camp_pilot',
  paymentStatus: 'paid',
  pilotStatus: 'active',
  agreedAt: '2026-01-01T00:00:00.000Z',
};

describe('renamePilotProgramTransaction', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    __setRenamePilotProgramRpcClientForTests({ rpc: mockedRpc });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }) as jest.Mock;
  });

  afterEach(() => {
    __setRenamePilotProgramRpcClientForTests(null);
  });

  test('calls the atomic RPC and syncs current browser program identity', async () => {
    writeActivePilotProgram(baseProgram);
    writeActiveFamilyContext({
      programCode: baseProgram.programCode,
      programName: baseProgram.programName,
      familyAccessCode: baseProgram.familyAccessCode,
      groupName: baseProgram.groupName,
      programType: baseProgram.programType,
    });
    writeActivePortalRole('family');
    writeActiveAccessCode(baseProgram.familyAccessCode);
    writeLastPilotProgram(baseProgram, 'family', baseProgram.adminEmail, baseProgram.familyAccessCode);
    writeRememberedProgramAccess(baseProgram.familyAccessCode, baseProgram);
    writeRememberedDeviceSession({
      access_code: baseProgram.familyAccessCode,
      program_id: baseProgram.id ?? null,
      program_code: baseProgram.programCode,
      user_type: 'parent',
      parent_id: 'parent-1',
      display_name: 'Breonna',
      program: baseProgram,
    });

    mockedRpc.mockResolvedValueOnce({
      data: {
        ok: true,
        oldProgramCode: 'CAMP-BLUERIBBON-2026',
        newProgramCode: 'CAMP-GDI-2026',
        programName: 'GDI Camp',
        adminEmail: 'Breonna.stills@yahoo.com',
        familyAccessCode: 'FAM-GDI-2026',
        facilitatorAccessCode: 'FAC-GDI-2026',
        rowsUpdated: [
          { table: 'participants', column: 'program_code', rowsUpdated: 1 },
          { table: 'student_family_links', column: 'camp_program_code', rowsUpdated: 1 },
        ],
      },
      error: null,
    });

    const result = await renamePilotProgramTransaction({
      oldProgramCode: baseProgram.programCode,
      newProgramCode: 'CAMP-GDI-2026',
      programName: 'GDI Camp',
      groupName: 'Morning Group',
      familyAccessCode: 'FAM-GDI-2026',
      facilitatorAccessCode: 'FAC-GDI-2026',
    });

    expect(result.success).toBe(true);
    expect(mockedRpc).toHaveBeenCalledWith('rename_pilot_program_transaction', {
      old_program_code_input: 'CAMP-BLUERIBBON-2026',
      new_program_code_input: 'CAMP-GDI-2026',
      new_program_name_input: 'GDI Camp',
      new_group_name_input: 'Morning Group',
      new_family_access_code_input: 'FAM-GDI-2026',
      new_facilitator_access_code_input: 'FAC-GDI-2026',
    });

    const lastFamily = readLastPilotProgramForRole('family');
    expect(lastFamily?.program_code).toBe('CAMP-GDI-2026');
    expect(lastFamily?.program.programCode).toBe('CAMP-GDI-2026');
    expect(lastFamily?.program.familyAccessCode).toBe('FAM-GDI-2026');
    expect(lastFamily?.last_access_code).toBe('FAM-GDI-2026');
    expect(readActiveAccessCode()).toBe('FAM-GDI-2026');
    const rememberedAccess = readRememberedProgramAccessRecord();
    expect(rememberedAccess?.program_code).toBe('CAMP-GDI-2026');
    expect(rememberedAccess?.access_code).toBe('FAM-GDI-2026');
    expect(rememberedAccess?.program.programCode).toBe('CAMP-GDI-2026');
    const rememberedDevice = readRememberedDeviceSession();
    expect(rememberedDevice?.program_code).toBe('CAMP-GDI-2026');
    expect(rememberedDevice?.access_code).toBe('FAM-GDI-2026');
    expect(rememberedDevice?.program?.programCode).toBe('CAMP-GDI-2026');
    expect(global.fetch).toHaveBeenCalledWith(
      '/.netlify/functions/send-welcome-email',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"emailType":"program_code_changed"'),
      }),
    );
  });
});
