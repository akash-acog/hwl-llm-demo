insert into facilities (name, city, state, aliases) values
  ('Mayo Clinic', 'Rochester', 'MN', array['Mayo', 'Mayo Clinic Rochester', 'Mayo Hospital']),
  ('Cleveland Clinic', 'Cleveland', 'OH', array['Cleveland Clinic Foundation', 'CCF', 'The Cleveland Clinic']),
  ('Johns Hopkins Hospital', 'Baltimore', 'MD', array['Johns Hopkins', 'JHH', 'Hopkins Hospital', 'Johns Hopkins Medical Center']),
  ('Massachusetts General Hospital', 'Boston', 'MA', array['Mass General', 'MGH', 'Massachusetts General']),
  ('UCLA Medical Center', 'Los Angeles', 'CA', array['UCLA Health', 'UCLA Hospital', 'Ronald Reagan UCLA Medical Center']),
  ('UCSF Medical Center', 'San Francisco', 'CA', array['UCSF Health', 'UCSF Hospital', 'UC San Francisco Medical Center']),
  ('NewYork-Presbyterian Hospital', 'New York', 'NY', array['NY Presbyterian', 'NYP', 'New York Presbyterian', 'Presbyterian Hospital']),
  ('Northwestern Memorial Hospital', 'Chicago', 'IL', array['Northwestern Memorial', 'NMH', 'Northwestern Hospital']),
  ('Cedars-Sinai Medical Center', 'Los Angeles', 'CA', array['Cedars-Sinai', 'Cedars Sinai', 'CSMC']),
  ('Stanford Health Care', 'Palo Alto', 'CA', array['Stanford Hospital', 'Stanford Medical Center', 'Stanford University Medical Center']),
  ('Mount Sinai Hospital', 'New York', 'NY', array['Mt Sinai', 'Mount Sinai', 'Mt. Sinai Hospital', 'The Mount Sinai Hospital']),
  ('Houston Methodist Hospital', 'Houston', 'TX', array['Houston Methodist', 'Methodist Hospital Houston']),
  ('Duke University Hospital', 'Durham', 'NC', array['Duke Hospital', 'Duke Medical Center', 'Duke University Medical Center']),
  ('Vanderbilt University Medical Center', 'Nashville', 'TN', array['Vanderbilt', 'VUMC', 'Vanderbilt Hospital']),
  ('Emory University Hospital', 'Atlanta', 'GA', array['Emory Hospital', 'Emory Healthcare', 'Emory']),
  ('University of Michigan Health', 'Ann Arbor', 'MI', array['Michigan Medicine', 'U of M Hospital', 'University of Michigan Hospital']),
  ('Penn Medicine', 'Philadelphia', 'PA', array['University of Pennsylvania Health', 'Penn Hospital', 'Hospital of the University of Pennsylvania', 'HUP']),
  ('Barnes-Jewish Hospital', 'St. Louis', 'MO', array['Barnes Jewish', 'BJH', 'Barnes Hospital']),
  ('Brigham and Womens Hospital', 'Boston', 'MA', array['Brigham', 'BWH', 'The Brigham', 'Brigham & Womens']),
  ('Memorial Sloan Kettering', 'New York', 'NY', array['MSK', 'Sloan Kettering', 'Memorial Sloan-Kettering Cancer Center']);

-- ============================================================================
-- CANONICAL JOB TITLES
-- ============================================================================
insert into canonical_job_titles (name, abbreviation, aliases, category) values
  -- Nursing - Direct Care
  ('Registered Nurse', 'RN', array['R.N.', 'Reg Nurse', 'Staff Nurse', 'Bedside Nurse', 'Floor Nurse'], 'nursing'),
  ('Licensed Practical Nurse', 'LPN', array['L.P.N.', 'Licensed Vocational Nurse', 'LVN', 'Practical Nurse', 'L.V.N.'], 'nursing'),
  ('Certified Nursing Assistant', 'CNA', array['C.N.A.', 'Nurse Aide', 'Nursing Assistant', 'Nurse Assistant', 'Patient Care Technician', 'PCT'], 'nursing'),
  ('Nurse Practitioner', 'NP', array['N.P.', 'APRN', 'Advanced Practice RN', 'Advanced Practice Registered Nurse', 'FNP', 'Family Nurse Practitioner'], 'nursing'),
  ('Clinical Nurse Specialist', 'CNS', array['C.N.S.', 'Nurse Specialist', 'Advanced Practice Nurse'], 'nursing'),
  ('Charge Nurse', 'CN', array['Lead Nurse', 'Nurse In Charge', 'Unit Charge Nurse', 'Shift Supervisor RN'], 'nursing'),
  ('Certified Registered Nurse Anesthetist', 'CRNA', array['Nurse Anesthetist', 'C.R.N.A.', 'Anesthesia Provider'], 'nursing'),

  -- Nursing - Specialty
  ('ICU Nurse', 'ICU RN', array['Intensive Care Nurse', 'Critical Care Nurse', 'CCU Nurse', 'Critical Care RN', 'MICU Nurse', 'SICU Nurse'], 'nursing-specialty'),
  ('Emergency Room Nurse', 'ER RN', array['ER Nurse', 'ED Nurse', 'Emergency Nurse', 'Emergency Department RN', 'Trauma Nurse'], 'nursing-specialty'),
  ('Operating Room Nurse', 'OR RN', array['OR Nurse', 'Surgical Nurse', 'Perioperative Nurse', 'Scrub Nurse', 'Circulating Nurse'], 'nursing-specialty'),
  ('Labor and Delivery Nurse', 'L&D RN', array['L&D Nurse', 'OB Nurse', 'Obstetric Nurse', 'Maternity Nurse', 'Delivery Room Nurse'], 'nursing-specialty'),
  ('NICU Nurse', 'NICU RN', array['Neonatal ICU Nurse', 'Neonatal Nurse', 'Newborn ICU Nurse', 'Neonatal Intensive Care Nurse'], 'nursing-specialty'),
  ('PICU Nurse', 'PICU RN', array['Pediatric ICU Nurse', 'Pediatric Intensive Care Nurse', 'Peds ICU Nurse'], 'nursing-specialty'),
  ('Oncology Nurse', 'Onc RN', array['Cancer Nurse', 'Chemo Nurse', 'Infusion Nurse', 'Oncology RN'], 'nursing-specialty'),
  ('Cardiac Nurse', 'Cardiac RN', array['Cardiology Nurse', 'Heart Nurse', 'Cardiovascular Nurse', 'CVICU Nurse'], 'nursing-specialty'),
  ('Telemetry Nurse', 'Tele RN', array['Telemetry RN', 'Tele Nurse', 'Cardiac Telemetry Nurse', 'Step-Down Nurse', 'PCU Nurse', 'Progressive Care Nurse'], 'nursing-specialty'),
  ('Med-Surg Nurse', 'MS RN', array['Medical Surgical Nurse', 'Med Surg RN', 'Medical-Surgical RN', 'General Floor Nurse'], 'nursing-specialty'),
  ('Dialysis Nurse', 'Dialysis RN', array['Nephrology Nurse', 'Renal Nurse', 'Hemodialysis Nurse', 'Acute Dialysis Nurse'], 'nursing-specialty'),
  ('Wound Care Nurse', 'WC RN', array['Wound Nurse', 'Ostomy Nurse', 'WOCN', 'Wound Ostomy Continence Nurse'], 'nursing-specialty'),
  ('Psychiatric Nurse', 'Psych RN', array['Mental Health Nurse', 'Behavioral Health Nurse', 'Psych Nurse', 'PMH RN'], 'nursing-specialty'),
  ('Home Health Nurse', 'HH RN', array['Home Care Nurse', 'Visiting Nurse', 'Home Health RN', 'Community Health Nurse'], 'nursing-specialty'),
  ('Post-Anesthesia Care Unit Nurse', 'PACU RN', array['PACU Nurse', 'Recovery Room Nurse', 'Perianesthesia Nurse'], 'nursing-specialty'),
  ('Endoscopy Nurse', 'Endo RN', array['GI Nurse', 'Gastroenterology Nurse', 'Endoscopy Lab Nurse'], 'nursing-specialty'),
  ('Interventional Radiology Nurse', 'IR RN', array['IR Nurse', 'Special Procedures Nurse', 'Radiology Nurse'], 'nursing-specialty'),
  ('Flight Nurse', 'Flight RN', array['Transport Nurse', 'Critical Care Transport Nurse', 'Air Ambulance Nurse'], 'nursing-specialty'),

  -- Nursing - Leadership
  ('Nurse Manager', 'NM', array['Nurse Unit Manager', 'Nursing Manager', 'Unit Manager', 'Head Nurse'], 'nursing-leadership'),
  ('Director of Nursing', 'DON', array['DNS', 'Nursing Director', 'Chief Nursing Officer', 'CNO'], 'nursing-leadership'),
  ('Assistant Director of Nursing', 'ADON', array['Asst DON', 'Assistant DON', 'Associate Director of Nursing'], 'nursing-leadership'),
  ('Nurse Educator', 'NE', array['Clinical Educator', 'Nursing Instructor', 'Staff Development Nurse', 'Clinical Nurse Educator'], 'nursing-leadership'),
  ('House Supervisor', 'Sup', array['Nursing Supervisor', 'Shift Administrator', 'Administrative Coordinator'], 'nursing-leadership'),

  -- Allied Health - Therapy
  ('Physical Therapist', 'PT', array['P.T.', 'Physiotherapist', 'Physical Therapy'], 'allied-therapy'),
  ('Physical Therapy Assistant', 'PTA', array['PT Assistant', 'Physical Therapist Assistant', 'Rehab Aide'], 'allied-therapy'),
  ('Occupational Therapist', 'OT', array['O.T.', 'Occupational Therapy'], 'allied-therapy'),
  ('Occupational Therapy Assistant', 'OTA', array['OT Assistant', 'COTA', 'Certified OT Assistant'], 'allied-therapy'),
  ('Respiratory Therapist', 'RT', array['R.T.', 'RRT', 'Registered Respiratory Therapist', 'Resp Therapist'], 'allied-therapy'),
  ('Speech Language Pathologist', 'SLP', array['S.L.P.', 'Speech Therapist', 'Speech Pathologist', 'ST'], 'allied-therapy'),
  ('Recreational Therapist', 'RecT', array['Therapeutic Recreation Specialist', 'Activity Therapist', 'CTRS'], 'allied-therapy'),

  -- Allied Health - Pharmacy
  ('Pharmacist', 'RPh', array['R.Ph.', 'Registered Pharmacist', 'PharmD', 'Clinical Pharmacist'], 'allied-pharmacy'),
  ('Pharmacy Technician', 'PharmTech', array['Pharmacy Tech', 'CPhT', 'Certified Pharmacy Technician'], 'allied-pharmacy'),

  -- Allied Health - Laboratory
  ('Medical Laboratory Technician', 'MLT', array['Lab Tech', 'Medical Lab Tech', 'Clinical Lab Technician'], 'lab'),
  ('Medical Laboratory Scientist', 'MLS', array['Medical Technologist', 'MT', 'Clinical Lab Scientist', 'CLS'], 'lab'),
  ('Phlebotomist', 'Phleb', array['Phlebotomy Tech', 'Blood Draw Tech', 'Venipuncture Tech'], 'lab'),
  ('Histotechnologist', 'HTL', array['Histotech', 'Histology Technician', 'HT'], 'lab'),
  ('Cytotechnologist', 'CT', array['Cytotech', 'Cellular Technologist'], 'lab'),

  -- Allied Health - Imaging & Diagnostics
  ('Radiologic Technologist', 'Rad Tech', array['X-Ray Tech', 'Radiographer', 'RT(R)', 'X-Ray Technologist'], 'imaging'),
  ('CT Technologist', 'CT Tech', array['CT Scan Tech', 'CAT Scan Tech', 'Computed Tomography Tech'], 'imaging'),
  ('MRI Technologist', 'MRI Tech', array['MR Tech', 'Magnetic Resonance Tech', 'MRI Technician'], 'imaging'),
  ('Ultrasound Technologist', 'Sono Tech', array['Sonographer', 'Ultrasound Tech', 'Diagnostic Medical Sonographer', 'DMS', 'General Ultrasound Tech'], 'imaging'),
  ('Nuclear Medicine Technologist', 'Nuc Med Tech', array['Nuclear Med Tech', 'NM Tech', 'CNMT'], 'imaging'),
  ('Interventional Radiology Technologist', 'IR Tech', array['IR Technologist', 'Special Procedures Tech', 'Angio Tech'], 'imaging'),
  ('Cath Lab Technologist', 'Cath Lab Tech', array['Cardiac Cath Lab Tech', 'Invasive Cardiovascular Tech', 'Cath Tech', 'RCIS'], 'imaging'),
  ('Echocardiographer', 'Echo Tech', array['Cardiac Sonographer', 'Echo Technologist', 'Cardiac Ultrasound Tech', 'RDCS'], 'imaging'),
  ('Vascular Technologist', 'Vascular Tech', array['Vascular Sonographer', 'RVT', 'Vascular Ultrasound Tech'], 'imaging'),
  ('Mammography Technologist', 'Mammo Tech', array['Mammographer', 'Breast Imaging Tech'], 'imaging'),
  ('Polysomnographic Technologist', 'Sleep Tech', array['Sleep Technician', 'RPSGT', 'Sleep Lab Tech'], 'imaging'),

  -- Surgical Services (Techs)
  ('Surgical Technologist', 'Surg Tech', array['CST', 'Scrub Tech', 'Operating Room Tech', 'OR Tech'], 'surgical-services'),
  ('Sterile Processing Technician', 'SPT', array['SPD Tech', 'CSSD Tech', 'Central Sterile Tech', 'Instrument Tech', 'CRCST'], 'surgical-services'),
  ('Surgical First Assistant', 'CSFA', array['First Assist', 'RNFA', 'Surgical Assistant'], 'surgical-services'),
  ('Perfusionist', 'CCP', array['Clinical Perfusionist', 'Cardiovascular Perfusionist'], 'surgical-services'),
  ('Anesthesia Technician', 'Anesthesia Tech', array['Cer.A.T.', 'Anesthesia Aide'], 'surgical-services'),

  -- Advanced Practice / Physicians (Locums)
  ('Physician Assistant', 'PA', array['P.A.', 'PA-C', 'Physician Associate', 'Certified PA'], 'provider'),
  ('Hospitalist', 'Hospitalist', array['Internal Medicine Physician', 'IM Physician'], 'provider'),
  ('Anesthesiologist', 'MDA', array['Anesthesia Physician', 'Medical Doctor Anesthesia'], 'provider'),
  ('Emergency Medicine Physician', 'EM Physician', array['ER Doctor', 'ED Physician'], 'provider'),
  ('Surgeon', 'Surgeon', array['General Surgeon', 'Trauma Surgeon'], 'provider'),
  ('Psychiatrist', 'Psychiatrist', array['Psych Physician', 'Behavioral Health Physician'], 'provider'),

  -- Support/Other
  ('Medical Assistant', 'MA', array['CMA', 'Certified Medical Assistant', 'Clinical Medical Assistant', 'RMA'], 'support'),
  ('Licensed Clinical Social Worker', 'LCSW', array['L.C.S.W.', 'Clinical Social Worker', 'Medical Social Worker', 'MSW'], 'social-work'),
  ('Case Manager', 'CM', array['RN Case Manager', 'Nurse Case Manager', 'Care Manager', 'Care Coordinator'], 'case-management'),
  ('Utilization Review Nurse', 'UR RN', array['UR Nurse', 'Utilization Management Nurse', 'UM Nurse'], 'case-management'),
  ('Registered Dietitian', 'RD', array['Dietitian', 'Nutritionist', 'Clinical Dietitian', 'RDN'], 'dietary'),
  ('Monitor Technician', 'Monitor Tech', array['Telemetry Technician', 'EKG Technician', 'ECG Tech'], 'support'),
  ('Sitter', 'Sitter', array['Patient Sitter', 'Safety Attendant', 'Patient Observer'], 'support');

-- ============================================================================
-- CANONICAL LICENSES
-- ============================================================================
insert into canonical_licenses (name, abbreviation, aliases) values
  ('Registered Nurse', 'RN', array['R.N.', 'Reg Nurse', 'Registered Nurse License', 'RN License']),
  ('Licensed Practical Nurse', 'LPN', array['L.P.N.', 'Licensed Vocational Nurse', 'LVN', 'Practical Nurse', 'L.V.N.']),
  ('Certified Nursing Assistant', 'CNA', array['C.N.A.', 'Nurse Aide', 'Nursing Assistant', 'Nurse Assistant', 'NA', 'State Tested Nursing Assistant', 'STNA']),
  ('Nurse Practitioner', 'NP', array['N.P.', 'APRN', 'Advanced Practice RN', 'Advanced Practice Registered Nurse', 'FNP', 'ANP']),
  ('Clinical Nurse Specialist', 'CNS', array['C.N.S.', 'Clinical Nurse Specialist License']),
  ('Certified Nurse Midwife', 'CNM', array['C.N.M.', 'Nurse Midwife', 'Midwife License']),
  ('Certified Registered Nurse Anesthetist', 'CRNA', array['C.R.N.A.', 'Nurse Anesthetist', 'Anesthetist License']),
  ('Physician Assistant', 'PA', array['P.A.', 'PA-C', 'Physician Associate', 'PA License']),
  ('Licensed Clinical Social Worker', 'LCSW', array['L.C.S.W.', 'Clinical Social Worker', 'LICSW', 'LSW', 'LMSW']),
  ('Physical Therapist', 'PT', array['P.T.', 'Physiotherapist', 'Physical Therapy License', 'DPT']),
  ('Physical Therapy Assistant', 'PTA', array['P.T.A.', 'PT Assistant License']),
  ('Occupational Therapist', 'OT', array['O.T.', 'Occupational Therapy License', 'OTR', 'OTR/L']),
  ('Occupational Therapy Assistant', 'OTA', array['O.T.A.', 'COTA', 'COTA/L']),
  ('Respiratory Care Practitioner', 'RCP', array['R.T.', 'Respiratory Therapist License', 'Respiratory Care License']),
  ('Speech Language Pathologist', 'SLP', array['S.L.P.', 'Speech Therapist', 'Speech Pathologist', 'CCC-SLP']),
  ('Medical Doctor', 'MD', array['M.D.', 'Physician', 'Doctor of Medicine', 'Medical License']),
  ('Doctor of Osteopathic Medicine', 'DO', array['D.O.', 'Osteopath', 'Osteopathic Physician']),
  ('Pharmacist', 'RPh', array['R.Ph.', 'Registered Pharmacist', 'PharmD', 'Pharmacy License']),
  ('Pharmacy Technician', 'PharmTech', array['Pharmacy Technician License', 'State Pharmacy Tech Registration']),
  ('Medical Technologist', 'MT', array['M.T.', 'Clinical Laboratory Scientist', 'MLS', 'CLS']),
  ('Radiologic Technologist', 'RT(R)', array['Rad Tech License', 'X-Ray Tech License', 'Radiographer License', 'ARRT']),
  ('Phlebotomist', 'CPT', array['Certified Phlebotomy Technician', 'Phlebotomy License', 'PBT']),
  ('Medical Assistant', 'CMA', array['Certified Medical Assistant', 'RMA', 'CCMA', 'NCMA']),
  ('Emergency Medical Technician', 'EMT', array['EMT-B', 'EMT-Basic', 'Emergency Medical Tech']),
  ('Paramedic', 'EMT-P', array['Paramedic License', 'EMT-Paramedic', 'NREMT-P']),
  ('Perfusionist', 'CCP', array['Perfusion License', 'Licensed Perfusionist']),
  ('Psychologist', 'PsyD', array['PhD Psych', 'Licensed Psychologist', 'Clinical Psychologist']),
  ('Dietitian/Nutritionist', 'LDN', array['Licensed Dietitian', 'Licensed Nutritionist', 'LD']),
  ('Athletic Trainer', 'ATC', array['Licensed Athletic Trainer', 'LAT']),
  ('Genetic Counselor', 'GC', array['LGC', 'Licensed Genetic Counselor']);

-- ============================================================================
-- CANONICAL CERTIFICATIONS
-- ============================================================================
insert into canonical_certifications (name, abbreviation, issuing_organization, aliases) values
  -- Life Support Certifications
  ('Basic Life Support', 'BLS', 'American Heart Association', array['BLS Provider', 'BLS-C', 'Basic Life Saving', 'BLS Healthcare Provider', 'CPR/BLS', 'BLS for Healthcare Providers']),
  ('Advanced Cardiovascular Life Support', 'ACLS', 'American Heart Association', array['ACLS Provider', 'Advanced Cardiac Life Support', 'AHA ACLS']),
  ('Pediatric Advanced Life Support', 'PALS', 'American Heart Association', array['PALS Provider', 'Pediatric ALS', 'AHA PALS']),
  ('Neonatal Resuscitation Program', 'NRP', 'American Academy of Pediatrics', array['NRP Provider', 'Neonatal Resuscitation', 'AAP NRP']),
  ('Advanced Trauma Life Support', 'ATLS', 'American College of Surgeons', array['ATLS Provider', 'Trauma Life Support']),
  ('Pediatric Emergency Assessment Recognition Stabilization', 'PEARS', 'American Heart Association', array['PEARS Provider', 'AHA PEARS']),
  ('S.T.A.B.L.E.', 'STABLE', 'The S.T.A.B.L.E. Program', array['STABLE Certification', 'Neonatal Stabilization']),

  -- Critical Care Certifications
  ('Critical Care Registered Nurse', 'CCRN', 'AACN Certification Corporation', array['CCRN-Adult', 'CCRN-Pediatric', 'CCRN-Neonatal', 'Critical Care Certification']),
  ('Progressive Care Certified Nurse', 'PCCN', 'AACN Certification Corporation', array['PCCN Certification', 'Step-Down Certification']),
  ('Cardiac Medicine Certification', 'CMC', 'AACN Certification Corporation', array['CMC Certification', 'Cardiac Certification']),
  ('Cardiac Surgery Certification', 'CSC', 'AACN Certification Corporation', array['CSC Certification']),

  -- Emergency Certifications
  ('Certified Emergency Nurse', 'CEN', 'Board of Certification for Emergency Nursing', array['Emergency Nurse Certification', 'Emergency Nursing Certification', 'BCEN CEN']),
  ('Certified Pediatric Emergency Nurse', 'CPEN', 'Board of Certification for Emergency Nursing', array['Pediatric Emergency Certification', 'BCEN CPEN']),
  ('Certified Flight Registered Nurse', 'CFRN', 'Board of Certification for Emergency Nursing', array['Flight Nurse Certification', 'BCEN CFRN']),
  ('Certified Transport Registered Nurse', 'CTRN', 'Board of Certification for Emergency Nursing', array['Transport Nurse Certification', 'BCEN CTRN']),
  ('Trauma Nursing Core Course', 'TNCC', 'Emergency Nurses Association', array['TNCC Provider', 'Trauma Nurse Certification', 'ENA TNCC']),
  ('Emergency Nursing Pediatric Course', 'ENPC', 'Emergency Nurses Association', array['ENPC Provider', 'Pediatric Emergency Course', 'ENA ENPC']),

  -- Surgical/Perioperative Certifications
  ('Certified Perioperative Nurse', 'CNOR', 'Competency & Credentialing Institute', array['C.N.O.R.', 'Perioperative Certification', 'OR Nurse Certification', 'CCI CNOR']),
  ('Certified Surgical Services Manager', 'CSSM', 'Competency & Credentialing Institute', array['Surgical Services Manager Certification']),
  ('Certified Ambulatory Perianesthesia Nurse', 'CAPA', 'American Board of Perianesthesia Nursing', array['CAPA Certification', 'ABPANC CAPA']),
  ('Certified Post Anesthesia Nurse', 'CPAN', 'American Board of Perianesthesia Nursing', array['CPAN Certification', 'PACU Certification', 'ABPANC CPAN']),
  ('Certified Surgical Technologist', 'CST', 'NBSTSA', array['NBSTSA CST', 'Certified Scrub Tech', 'Certified OR Tech']),
  ('Certified Surgical First Assistant', 'CSFA', 'NBSTSA', array['NBSTSA CSFA', 'First Assist Certification']),
  ('Certified Registered Central Service Technician', 'CRCST', 'HSPA', array['IAHCSMM', 'Sterile Processing Certification', 'SPD Certification']),

  -- Specialty Certifications
  ('Oncology Certified Nurse', 'OCN', 'Oncology Nursing Certification Corporation', array['O.C.N.', 'Oncology Nursing Certification', 'ONCC OCN']),
  ('Chemotherapy Immunotherapy Certificate', 'Chemo Cert', 'Oncology Nursing Society', array['ONS Chemo', 'Chemo Provider']),
  ('Certified Medical-Surgical Registered Nurse', 'CMSRN', 'Academy of Medical-Surgical Nurses', array['Med-Surg Certification', 'Medical Surgical Certification', 'AMSN CMSRN']),
  ('Inpatient Obstetric Nursing', 'RNC-OB', 'National Certification Corporation', array['RNC-OB Certification', 'OB Nursing Certification', 'Obstetric Nurse Certification', 'NCC RNC-OB']),
  ('Neonatal Intensive Care Nursing', 'RNC-NIC', 'National Certification Corporation', array['NICU Certification', 'Neonatal Certification', 'NCC RNC-NIC']),
  ('Low Risk Neonatal Nursing', 'RNC-LRN', 'National Certification Corporation', array['LRN Certification', 'NCC RNC-LRN']),
  ('Electronic Fetal Monitoring', 'C-EFM', 'National Certification Corporation', array['EFM Certification', 'Fetal Monitoring Certification', 'NCC C-EFM']),
  ('Certified Wound Ostomy Continence Nurse', 'CWOCN', 'Wound Ostomy Continence Nursing Certification Board', array['Wound Care Certification', 'Ostomy Certification', 'WOCNCB CWOCN']),
  ('Certified Wound Care Nurse', 'CWCN', 'Wound Ostomy Continence Nursing Certification Board', array['Wound Certification', 'WOCNCB CWCN']),
  ('Certified Rehabilitation Registered Nurse', 'CRRN', 'Association of Rehabilitation Nurses', array['Rehab Nurse Certification', 'ARN CRRN']),
  ('Certified Diabetes Care and Education Specialist', 'CDCES', 'Certification Board for Diabetes Care and Education', array['CDE', 'Certified Diabetes Educator', 'Diabetes Certification', 'CBDCE CDCES']),
  ('Certified Nephrology Nurse', 'CNN', 'Nephrology Nursing Certification Commission', array['Nephrology Certification', 'Dialysis Certification', 'NNCC CNN']),
  ('Certified Dialysis Nurse', 'CDN', 'Nephrology Nursing Certification Commission', array['Dialysis Nurse Certification', 'NNCC CDN']),
  ('Psychiatric-Mental Health Nursing Certification', 'PMH-BC', 'American Nurses Credentialing Center', array['Psych Certification', 'Mental Health Certification', 'ANCC PMH-BC']),
  ('Gerontological Nursing Certification', 'GERO-BC', 'American Nurses Credentialing Center', array['Geriatric Certification', 'ANCC GERO-BC']),
  ('Pediatric Nursing Certification', 'CPN', 'Pediatric Nursing Certification Board', array['Certified Pediatric Nurse', 'PNCB CPN']),
  ('Certified Hospice and Palliative Nurse', 'CHPN', 'Hospice and Palliative Credentialing Center', array['Hospice Certification', 'Palliative Certification', 'HPCC CHPN']),
  ('Certified Case Manager', 'CCM', 'Commission for Case Manager Certification', array['Case Management Certification', 'CCMC CCM']),
  ('Sexual Assault Nurse Examiner', 'SANE', 'International Association of Forensic Nurses', array['SANE-A', 'SANE-P', 'Forensic Nurse Certification']),

  -- Stroke/Neuro Certifications
  ('NIH Stroke Scale', 'NIHSS', 'American Stroke Association', array['NIH Stroke Certification', 'Stroke Scale Certification', 'ASA NIHSS']),
  ('Stroke Certified Registered Nurse', 'SCRN', 'American Board of Neuroscience Nursing', array['Stroke Certification', 'ABNN SCRN']),
  ('Certified Neuroscience Registered Nurse', 'CNRN', 'American Board of Neuroscience Nursing', array['Neuro Nurse Certification', 'ABNN CNRN']),

  -- Infection Control
  ('Certification in Infection Prevention and Control', 'CIC', 'Certification Board of Infection Control', array['Infection Control Certification', 'CBIC CIC']),

  -- IV/Infusion
  ('Certified Registered Nurse Infusion', 'CRNI', 'Infusion Nurses Certification Corporation', array['Infusion Certification', 'IV Certification', 'INCC CRNI']),
  ('Vascular Access Board Certified', 'VA-BC', 'Vascular Access Certification Corporation', array['Vascular Access Certification', 'VACC VA-BC']),

  -- Imaging & Allied Specifics (ARRT, etc)
  ('ARRT Radiography', 'ARRT(R)', 'American Registry of Radiologic Technologists', array['Radiography Certification', 'X-Ray Certification']),
  ('ARRT Computed Tomography', 'ARRT(CT)', 'American Registry of Radiologic Technologists', array['CT Certification', 'CAT Scan Certification']),
  ('ARRT Magnetic Resonance Imaging', 'ARRT(MR)', 'American Registry of Radiologic Technologists', array['MRI Certification']),
  ('ARRT Mammography', 'ARRT(M)', 'American Registry of Radiologic Technologists', array['Mammo Certification']),
  ('ARRT Nuclear Medicine', 'ARRT(N)', 'American Registry of Radiologic Technologists', array['Nuc Med Certification']),
  ('Registered Diagnostic Medical Sonographer', 'RDMS', 'ARDMS', array['Ultrasound Certification', 'Sonography Certification']),
  ('Registered Vascular Technologist', 'RVT', 'ARDMS', array['Vascular Certification', 'Vascular Tech Certification']),
  ('Registered Cardiac Sonographer', 'RCS', 'CCI', array['Echo Certification', 'Cardiac Sonography Certification']),
  ('Registered Cardiovascular Invasive Specialist', 'RCIS', 'CCI', array['Cath Lab Certification', 'Invasive Cardio Certification']),

  -- Respiratory Specifics
  ('Adult Critical Care Specialist', 'ACCS', 'NBRC', array['Respiratory Critical Care', 'ACCS-RRT']),
  ('Neonatal/Pediatric Specialist', 'NPS', 'NBRC', array['Neo/Peds Respiratory', 'NPS-RRT']),
  ('Registered Polysomnographic Technologist', 'RPSGT', 'BRPT', array['Sleep Tech Certification', 'Sleep Certification']),

  -- Behavioral/Safety
  ('Nonviolent Crisis Intervention', 'CPI', 'Crisis Prevention Institute', array['CPI Blue Card', 'Crisis Prevention Certification']),
  ('Management of Aggressive Behavior', 'MOAB', 'MOAB Training International', array['MOAB Certification']),
  ('Professional Crisis Management', 'PCM', 'PCMA', array['PCM Certification']);
