export interface RowAuditComment {
  id: string;
  testKey: string;
  rowIndex?: number;
  comment: string;
  author: string;
  timestamp: string;
  resolved: boolean;
}

export interface ReviewRecord {
  reviewerId: string;
  reviewerName: string;

  recommendation: 'APPROVE' | 'REMAND';

  comments: RowAuditComment[];

  reviewedAt?: string;

  remandReason?: string;

  // Compatibility
  verdict?: 'APPROVED' | 'REMANDED';
  flaggedItems?: string[];
}

export interface SignatureRecord {
  directorId: string;
  directorName: string;

  signedAt: string;

  digest: string;

  declarationAccepted: boolean;

  sealApplied: boolean;

  certificateId?: string;

  // Compatibility
  signedBy?: string;
  role?: string;
  digitalCertificateId?: string;
  qrCodePayload?: string;
  cryptographicHash?: string;
  formType?: 'FORM_VI_VERIFICATION_CERTIFICATE' | 'FORM_VII_REJECTION_NOTICE';
}
