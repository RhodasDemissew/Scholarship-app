\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE sample "OpportunityCycles"%ROWTYPE;
BEGIN
 SELECT * INTO STRICT sample FROM "OpportunityCycles" WHERE "Id"='c950dff5-741a-4946-a266-7f532a613027';
 sample."Id" := gen_random_uuid();
 BEGIN
  INSERT INTO "OpportunityCycles" SELECT sample.*;
  RAISE EXCEPTION 'Duplicate nullable-award cycle was accepted';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
 sample."Round" := 'second-round-test';
 sample."PublicationStatus" := 'Draft';
 sample."ApplicationStatus" := 'Open';
 INSERT INTO "OpportunityCycles" SELECT sample.*;
 IF NOT EXISTS (SELECT 1 FROM "OpportunityCycles" WHERE "Id"=sample."Id" AND "PublicationStatus"='Draft' AND "ApplicationStatus"='Open') THEN
  RAISE EXCEPTION 'Independent statuses or separate round failed';
 END IF;
 sample."Id" := gen_random_uuid();
 sample."IntakeLabel" := '2028 intake';
 INSERT INTO "OpportunityCycles" SELECT sample.*;
END $$;
ROLLBACK;
