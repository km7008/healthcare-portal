"""
seed_bot_questions.py  -  loads the Nextenti bot sheet into the knowledge_base table

Source: Nextenti-Bot-Questions1_1.xlsx  (22 buttons: General 6, Personal 8, Organization 8)

For every button of the sheet these phrases all get the SAME mapped answer:
  * the button label            ("Reset or change my password")
  * every sample question       ("Where can I reset my password?")
  * every intent / match phrase ("forgot password")
so a typed or spoken question finds the answer, and a button click is an exact match.

HOW TO RUN (once, from the backend folder, with the virtual environment active):
    python seed_bot_questions.py

It first saves a copy of the old table (knowledge_base_backup, only the first time),
then replaces the content of knowledge_base. Restart the backend afterwards.
"""

import sys
import uuid

from sqlalchemy import text

ROWS = [{'id': 'BOT-GEN-01',
  'category': 'General',
  'order': 1,
  'label': 'Find & apply for jobs',
  'answer': 'Looking for a healthcare job? Sign in, go to Search Jobs, and filter by job title, location or '
            'organization type — then apply to anything that fits. You can apply to as many roles as you '
            'like. Want me to walk you through getting started?',
  'intents': ['find a job', 'search jobs', 'apply for job', 'looking for work', 'healthcare jobs'],
  'questions': ['How can I find a healthcare job on Nextenti?',
                'Where can I search for healthcare jobs?',
                'How do I apply for a job?',
                'Can I apply for multiple jobs?',
                'Are there healthcare jobs available on Nextenti?',
                'Can I search for jobs by profession?',
                'Can I find part-time or full-time healthcare jobs?']},
 {'id': 'BOT-GEN-02',
  'category': 'General',
  'order': 2,
  'label': 'Post a job',
  'answer': 'Hiring? With an Organization account you can post a vacancy in real time from Create Job/Post '
            'Job after login — our AI then matches it to relevant candidates and you can view the profiles '
            'once applied by candidate. Need help posting your first job?',
  'intents': ['post a job', 'hire', 'recruit', 'find candidates', 'employer'],
  'questions': ['How do I post a job on Nextenti?',
                'How can I hire healthcare professionals?',
                'Where can I create a new job vacancy?',
                'How do I find candidates for my job?',
                'Can my organization post a vacancy on Nextenti?',
                'How do I create a job posting?',
                'Do I need an organization account to post a job?']},
 {'id': 'BOT-GEN-03',
  'category': 'General',
  'order': 3,
  'label': 'Reset or change my password',
  'answer': 'Forgot your password? On the Login page tap Forgot Password and follow the steps to reset it. '
            'Already logged in and just want to change it? Go to Settings > Change Password.',
  'intents': ['forgot password', 'reset password', 'change password', "can't log in", 'locked out'],
  'questions': ['I forgot my password. How can I reset it?',
                'How do I change my Nextenti password?',
                "I can't log in to my account. What should I do?",
                'Where can I reset my password?',
                "What should I do if I don't remember my password?",
                'How can I recover access to my account?',
                'Where is the Forgot Password option?',
                'Can I change my password after logging in?']},
 {'id': 'BOT-GEN-04',
  'category': 'General',
  'order': 4,
  'label': 'Is my data safe?',
  'answer': 'Yes — your data security is our priority. Your details stay confidential and organizations '
            "can't see your profile unless you apply for a job and give consent. Aadhaar data is used only "
            'for lawful, regulated purposes.',
  'intents': ['data protection', 'privacy', 'is my data safe', 'aadhaar', 'security'],
  'questions': ['Is my personal data safe on Nextenti?',
                'Who can see my profile and personal information?',
                'How does Nextenti protect my data?',
                'Is my Aadhaar information secure?',
                'Will organizations be able to see my profile without applying?',
                'Does Nextenti keep my information confidential?',
                'What happens to the personal information I provide?',
                'Why does Nextenti need Aadhaar information?']},
 {'id': 'BOT-GEN-05',
  'category': 'General',
  'order': 5,
  'label': 'Who can use Nextenti?',
  'answer': 'Nextenti is for all healthcare professionals — doctors, nurses, pharmacists, lab technicians, '
            'healthcare IT and more (up to 19 professions across 14 sectors). Job seekers find flexible '
            'roles; organizations find qualified staff.',
  'intents': ['who can use', 'is it for doctors', 'eligibility', 'what is nextenti', 'professions'],
  'questions': ['Who can use Nextenti?',
                'Is Nextenti available for doctors and nurses?',
                'Which professions are supported?',
                'Can healthcare professionals from different fields use Nextenti?',
                'Can I use Nextenti if I am a healthcare professional?',
                'Is Nextenti only for doctors?',
                'Can nurses use Nextenti?',
                'What types of healthcare jobs are available?']},
 {'id': 'BOT-GEN-06',
  'category': 'General',
  'order': 6,
  'label': 'Talk to support',
  'answer': 'I’m happy to help. You can raise a support query anytime through Support > Nextenti Support on '
            'the mobile app, the Nextenti Help Support widget at the bottom of the web page, or by '
            'contacting us through the mobile number listed in the Contact Us section.\n'
            '\n'
            'If you need immediate assistance, I can connect you with a support agent.',
  'intents': ['contact support', 'talk to agent', 'help', 'customer service', 'human'],
  'questions': ['How can I contact Nextenti support?',
                'How do I raise a support query?',
                'Can I talk to a support agent?',
                'Where can I get help with my Nextenti account?',
                'Where can I raise a support ticket?',
                'How do I reach the Nextenti support team?',
                'Is there a way to speak with a human agent?',
                'What are the ways to contact Nextenti?']},
 {'id': 'BOT-PER-01',
  'category': 'Personal',
  'order': 1,
  'label': 'Search & apply for jobs',
  'answer': 'Go to Search Jobs and filter by job title, location or organization, then apply to any role '
            'that fits — you can apply to several jobs at once. You can also save jobs to review later from '
            'Saved Jobs.',
  'intents': ['search jobs', 'apply', 'find work', 'save jobs', 'filter jobs'],
  'questions': ['How do I search and apply for jobs?',
                'Where can I find jobs on Nextenti?',
                'Can I save a job and apply later?',
                'How do I filter jobs by location or profession?',
                'Can I search jobs based on my profession?',
                'How do I find jobs near my preferred location?',
                'Where are my saved jobs?',
                'Can I apply to more than one job?']},
 {'id': 'BOT-PER-02',
  'category': 'Personal',
  'order': 2,
  'label': 'Track my application status',
  'answer': 'Go to Applied Jobs section to see the status of each application, such as Interview Scheduled '
            'or Offered. You will also receive notifications of your application status.',
  'intents': ['application status', 'track application', 'interview scheduled', 'applied jobs'],
  'questions': ['How can I check my application status?',
                'Where can I see the jobs I have applied for?',
                'How do I know if I have been shortlisted?',
                'Where can I see my interview or offer status?',
                'Has my job application been reviewed?',
                'How do I know if I was shortlisted?',
                'Will I get notified when my application status changes?',
                'Where can I check whether an interview is scheduled?']},
 {'id': 'BOT-PER-03',
  'category': 'Personal',
  'order': 3,
  'label': 'View & manage job offers',
  'answer': 'Find all your offers under Applied > Offered Jobs. From there you can review the details, '
            "Decline an offer you don't want, or submit a Raise Request to negotiate the salary.",
  'intents': ['job offers', 'view offers', 'decline offer', 'negotiate salary', 'raise request'],
  'questions': ['Where can I see my job offers?',
                'How do I accept or decline a job offer?',
                'Can I negotiate the salary offered?',
                'How do I submit a raise request for an offer?',
                'How do I check the details of an offer?',
                'Can I reject a job offer?',
                'Can I request a higher salary?',
                'Where can I find my offered jobs?']},
 {'id': 'BOT-PER-04',
  'category': 'Personal',
  'order': 4,
  'label': 'Set my availability',
  'answer': 'Open your Personal account and tap Add Availability to set the days and hours you can work — '
            'including specific Consultation or Procedure slots. Your availability is private; we use it to '
            'match you with jobs that fit your schedule.',
  'intents': ['availability', 'add availability', 'consultation', 'procedure', 'work hours', 'schedule'],
  'questions': ['How do I set my availability?',
                'Where can I add my working hours?',
                'Can I set specific consultation or procedure slots?',
                'Will other users be able to see my availability?',
                'Can I specify when I am available to work?',
                'How do I add my available days?',
                'Can I update my availability later?',
                'Is my availability visible to organizations?']},
 {'id': 'BOT-PER-05',
  'category': 'Personal',
  'order': 5,
  'label': 'Get better job recommendations',
  'answer': 'Open User Profile > Preferences and set your organization type, locations and area of work. Our '
            'AI uses these to match you with suitable roles in Recommended Jobs.',
  'intents': ['recommendations', 'recommended jobs', 'preferences', 'location preferences', 'matching'],
  'questions': ['How can I get better job recommendations?',
                'How does Nextenti recommend jobs to me?',
                'Where can I update my job preferences?',
                'How can I change my preferred locations or organization type?',
                'How can I improve the jobs shown to me?',
                'Why am I seeing these job recommendations?',
                'Can I choose my preferred work locations?',
                'Can I update my job preferences?']},
 {'id': 'BOT-PER-06',
  'category': 'Personal',
  'order': 6,
  'label': 'Update my profile or mobile number',
  'answer': 'Go to Edit Profile > Personal Details to update your photo, profession or mobile number. '
            'Changing your mobile number needs your password and an OTP sent to the new number for '
            'verification.',
  'intents': ['update profile',
              'change profession',
              'profile picture',
              'change mobile number',
              'edit details'],
  'questions': ['How do I update my profile?',
                'How can I change my mobile number?',
                'Where can I update my profession or profile picture?',
                'What do I need to change my registered mobile number?',
                'How do I edit my personal details?',
                'Can I change the phone number linked to my account?',
                'How do I update my profile photo?',
                'Do I need an OTP to change my mobile number?']},
 {'id': 'BOT-PER-07',
  'category': 'Personal',
  'order': 7,
  'label': 'Reset or change my password',
  'answer': 'Forgot it? Use Forgot Password on the Login page. Want to change a password you know? Go to '
            'Settings > Change Password.',
  'intents': ['forgot password', 'reset password', 'change password', 'locked out'],
  'questions': ['I forgot my candidate account password. How can I reset it?',
                'How do I change my candidate account password?',
                'I am locked out of my account. What should I do?',
                'Where can I reset my password?',
                "What can I do if I don't remember my password?",
                'How can I recover my candidate account?',
                'Where can I find the Forgot Password option?',
                'Can I change my password from Settings?']},
 {'id': 'BOT-PER-08',
  'category': 'Personal',
  'order': 8,
  'label': 'Talk to support',
  'answer': 'Happy to help. Submit a query via Support > Nextenti Support, or I can connect you to a support '
            'agent now.',
  'intents': ['contact support', 'talk to agent', 'help', 'stuck', 'human'],
  'questions': ['How can I contact candidate support?',
                'How do I raise a support request?',
                'Can I speak to a support agent?',
                'I need help with my candidate account. Who can I contact?',
                'Where can I submit a support query?',
                'How do I contact candidate support?',
                'Can I speak to a support representative?',
                'I am facing an issue with my account. Who can help?']},
 {'id': 'BOT-ORG-01',
  'category': 'Organization',
  'order': 1,
  'label': 'Post a job',
  'answer': 'Go to Create Job/Post Job, fill in the title, profession, job type & duration, description and '
            'required details, then click Post Job. Our AI matches it to qualified candidates right away. '
            'You can also save it as a template/draft to use it later.',
  'intents': ['post a job', 'create job', 'new vacancy', 'hire', 'list a job'],
  'questions': ['How do I post a new job?',
                'Where can I create a job vacancy?',
                'What details are required to post a job?',
                'Can I save a job as a draft or template?',
                'What information do I need to post a job?',
                'Can I save a job posting and complete it later?',
                'How does AI match candidates to my job?',
                'Can I create a job template?']},
 {'id': 'BOT-ORG-02',
  'category': 'Organization',
  'order': 2,
  'label': 'Manage my jobs',
  'answer': 'From your Home screen you can open Posted, Drafted, Closed or Cancelled Jobs. To close or '
            'cancel a job, tap the three-dots (⋮) menu on the job card and choose Close Job or Cancel Job.',
  'intents': ['posted jobs',
              'drafted jobs',
              'closed jobs',
              'cancelled jobs',
              'close job',
              'cancel job',
              'manage jobs'],
  'questions': ['How can I manage my posted jobs?',
                'Where can I see my drafted or closed jobs?',
                'How do I close a job posting?',
                'How do I cancel a job?',
                'Where can I see all my job postings?',
                'How do I view my draft jobs?',
                'Can I reopen or close a posted job?']},
 {'id': 'BOT-ORG-03',
  'category': 'Organization',
  'order': 3,
  'label': 'Subscription & plans',
  'answer': 'Go to the Profile menu > Manage Subscription, choose the plan that fits your needs, and '
            'complete payment to activate it. You can update billing details under Profile > (Next through) '
            'Billing Details.',
  'intents': ['subscription', 'plans', 'upgrade', 'billing', 'payment', 'manage subscription'],
  'questions': ['What subscription plans are available?',
                'How do I upgrade my subscription?',
                'Where can I manage my subscription?',
                'How can I update my billing details?',
                'How do I subscribe to a plan?',
                'Where can I see my current subscription?',
                'How can I make a subscription payment?',
                "How do I update my organization's billing details?"]},
 {'id': 'BOT-ORG-04',
  'category': 'Organization',
  'order': 4,
  'label': 'Timesheets & attendance',
  'answer': 'The Timesheet section tracks employee check-ins and check-outs for part time jobs. View your '
            "team's full history any time under Timesheet Logs.",
  'intents': ['timesheet', 'attendance', 'check-in', 'check-out', 'timesheet logs', 'working hours'],
  'questions': ['Where can I see employee attendance?',
                'How do I check employee check-in and check-out times?',
                'Where can I view timesheet logs?',
                'How do I track working hours for part-time employees?',
                'How can I track employee check-ins?',
                'Where can I see employee working hours?',
                'How do I view attendance records?',
                'Can I check the timesheet history for my team?']},
 {'id': 'BOT-ORG-05',
  'category': 'Organization',
  'order': 5,
  'label': 'Manage users',
  'answer': 'Go to User Management in the side menu, click Add User, enter their name, email and role, set '
            "permissions, then Save. They'll get an invitation to log in and work according to their "
            'permissions.',
  'intents': ['add user', 'manage users', 'team members', 'roles', 'permissions', 'invite user'],
  'questions': ['How do I add a new user to my organization?',
                'Where can I manage team members?',
                'How do I assign roles and permissions to users?',
                'How can I invite an employee to Nextenti?',
                'Can I add multiple users to my organization?',
                'How do I give permissions to a team member?',
                'How does a new user access the account?',
                'Where can I edit user roles?']},
 {'id': 'BOT-ORG-06',
  'category': 'Organization',
  'order': 6,
  'label': 'Edit organization / billing details',
  'answer': 'Open Profile in the side menu. You can edit each section one by one Organization Details, '
            'Organization Profile, Authorized Person Details and Billing Details.',
  'intents': ['edit organization details',
              'billing details',
              'authorized person',
              'company profile',
              'update details'],
  'questions': ['How do I edit my organization details?',
                'Where can I update my billing information?',
                'How can I change the authorized person details?',
                'Where can I edit my organization profile?',
                'Where can I edit my company information?',
                "How do I update my organization's profile?",
                'Can I change the billing information?',
                "Where can I update the authorized person's details?"]},
 {'id': 'BOT-ORG-07',
  'category': 'Organization',
  'order': 7,
  'label': 'Reset or change my password',
  'answer': 'On the Login page, tap Forgot Password and follow the prompts (registered email or mobile) to '
            'create a new password.',
  'intents': ['forgot password', 'reset password', 'change password', 'locked out'],
  'questions': ['I forgot my organization account password. How can I reset it?',
                'How do I change my organization account password?',
                "I can't log in to my organization account. What should I do?",
                'Can I reset my password using my email or mobile number?',
                'What should I do if I forgot my organization password?',
                'How can I recover access to my organization account?',
                'Can I reset my password using my registered mobile number?',
                'Where can I find Forgot Password?']},
 {'id': 'BOT-ORG-08',
  'category': 'Organization',
  'order': 8,
  'label': 'Talk to support',
  'answer': 'Happy to help. Submit a query via Nextenti Support, or I can connect you to a support agent '
            'now.',
  'intents': ['contact support', 'talk to agent', 'help', 'human', 'chat requests'],
  'questions': ['How can I contact organization support?',
                'How do I raise a support request for my organization?',
                'Can I talk to a support agent?',
                'I need help with my organization account. Who can I contact?',
                'Where can I raise a support request?',
                'How do I contact organization support?',
                'Can I speak with a support agent?',
                'I have an issue with my organization account. How can I get help?']}]


def build_entries():
    """-> list of (category, question, answer); duplicates inside a category are skipped"""
    seen = set()
    entries = []

    for row in ROWS:
        phrases = [row["label"]] + row["questions"] + row["intents"]

        for phrase in phrases:
            key = (row["category"], phrase.strip().lower())

            if key in seen:
                continue

            seen.add(key)
            entries.append((row["category"], phrase.strip(), row["answer"]))

    return entries


def main():
    from database import SessionLocal  # imported here so the data above can be tested alone

    entries = build_entries()
    db = SessionLocal()

    try:
        columns = {
            r.column_name: r
            for r in db.execute(
                text(
                    """
                    SELECT column_name, data_type, column_default, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'knowledge_base'
                    """
                )
            )
        }

        if not columns:
            print("The table knowledge_base does not exist. Start the backend once first.")
            sys.exit(1)

        # columns we cannot fill ourselves
        known = {"id", "category", "question", "answer"}
        required_other = [
            name
            for name, c in columns.items()
            if name not in known and c.is_nullable == "NO" and c.column_default is None
        ]

        if required_other:
            print("knowledge_base has extra required columns:", required_other)
            print("Tell me about them and I will adjust this script.")
            sys.exit(1)

        # one-time backup of the old FAQs
        db.execute(text("CREATE TABLE IF NOT EXISTS knowledge_base_backup AS TABLE knowledge_base"))
        db.execute(text("DELETE FROM knowledge_base"))

        id_info = columns.get("id")
        need_id = id_info is not None and id_info.column_default is None
        next_int = 1

        for category, question, answer in entries:
            params = {"c": category, "q": question, "a": answer}

            if need_id:
                if "uuid" in id_info.data_type:
                    params["i"] = str(uuid.uuid4())
                else:
                    params["i"] = next_int
                    next_int += 1

                db.execute(
                    text(
                        "INSERT INTO knowledge_base (id, category, question, answer) "
                        "VALUES (:i, :c, :q, :a)"
                    ),
                    params,
                )
            else:
                db.execute(
                    text(
                        "INSERT INTO knowledge_base (category, question, answer) "
                        "VALUES (:c, :q, :a)"
                    ),
                    params,
                )

        db.commit()

        print("Done. %d phrases for %d buttons loaded into knowledge_base." % (len(entries), len(ROWS)))
        print("The old content is kept in the table knowledge_base_backup.")

    except Exception as exc:
        db.rollback()
        print("Nothing was changed. Error:", exc)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()