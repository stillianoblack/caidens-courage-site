export type KidPlaySessionSource =
  | 'family_home'
  | 'camp_roster_launch'
  | 'facilitator_roster_launch'
  | 'school_access_code'
  | 'future_child_pin';

export type KidPlayDeviceMode =
  | 'home_device'
  | 'shared_camp_device'
  | 'shared_school_device'
  | 'child_owned_device';

export type KidPlaySessionStatus = 'active' | 'ended' | 'expired' | 'moved';

export type KidPlaySessionRow = {
  id: string;
  child_id: string;
  participant_id: string | null;
  organization_id: string | null;
  launched_by_user_id: string | null;
  session_source: KidPlaySessionSource;
  device_mode: KidPlayDeviceMode;
  status: KidPlaySessionStatus;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
  ended_reason: string | null;
  device_label: string | null;
  resume_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type CreateKidPlaySessionInput = {
  childId: string;
  participantId?: string | null;
  organizationId?: string | null;
  launchedByUserId?: string | null;
  sessionSource: KidPlaySessionSource;
  deviceMode?: KidPlayDeviceMode;
  deviceLabel?: string | null;
  resumePayload?: Record<string, unknown> | null;
};

export type EndKidPlaySessionInput = {
  sessionId: string;
  reason: string;
  status?: Exclude<KidPlaySessionStatus, 'active'>;
};
