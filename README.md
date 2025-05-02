# IT-Quiz

UGC quiz website

## Models

```mermaid
erDiagram
    users {
        UUID user_id PK "gen_random_uuid()"
        VARCHAR username UK "UNIQUE"
        VARCHAR email UK "UNIQUE"
        VARCHAR password_hash
        BOOLEAN is_admin "DEFAULT FALSE"
        BOOLEAN is_moderator "DEFAULT FALSE"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    quizzes {
        UUID quiz_id PK "gen_random_uuid()"
        VARCHAR title
        TEXT description
        VARCHAR quiz_image_url
        UUID created_by FK "ON DELETE SET NULL"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at
        BOOLEAN is_draft "DEFAULT TRUE"
        BOOLEAN is_published "DEFAULT FALSE"
        VARCHAR difficulty
        INTEGER timer_duration_seconds
    }

    questions {
        UUID question_id PK "gen_random_uuid()"
        TEXT question_text
        VARCHAR question_image_url
        question_type question_type "ENUM"
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP updated_at
    }

    quiz_questions {
        UUID quiz_question_id PK "gen_random_uuid()"
        UUID quiz_id FK "ON DELETE CASCADE"
        UUID question_id FK "ON DELETE CASCADE"
        INTEGER question_order
    }

    answers {
        UUID answer_id PK "gen_random_uuid()"
        UUID question_id FK "ON DELETE CASCADE"
        TEXT answer_text
        BOOLEAN is_correct "DEFAULT FALSE"
        INTEGER sort_order
        TEXT explanation
        TIMESTAMP created_at "DEFAULT CURRENT_TIMESTAMP"
    }

    tags {
        UUID tag_id PK "gen_random_uuid()"
        VARCHAR tag_name UK "UNIQUE"
    }

    quiz_tags {
        UUID quiz_tag_id PK "gen_random_uuid()"
        UUID quiz_id FK "ON DELETE CASCADE"
        UUID tag_id FK "ON DELETE CASCADE"
    }

    quiz_attempts {
        UUID attempt_id PK "gen_random_uuid()"
        UUID quiz_id FK "ON DELETE CASCADE"
        UUID user_id FK "ON DELETE CASCADE"
        TIMESTAMP started_at "DEFAULT CURRENT_TIMESTAMP"
        TIMESTAMP completed_at
        INTEGER score
        INTEGER time_taken_seconds
        BOOLEAN is_completed "DEFAULT FALSE"
    }

    user_answers {
        UUID user_answer_id PK "gen_random_uuid()"
        UUID attempt_id FK "ON DELETE CASCADE"
        UUID quiz_question_id FK "ON DELETE CASCADE"
        UUID selected_answer_id FK "ON DELETE SET NULL"
        TEXT manual_input_text
        JSONB arranged_order_ids
        BOOLEAN is_correct
    }

    reports {
        UUID report_id PK "gen_random_uuid()"
        UUID reported_by FK "ON DELETE SET NULL"
        TIMESTAMP reported_at "DEFAULT CURRENT_TIMESTAMP"
        VARCHAR report_type
        UUID reported_quiz_id FK "ON DELETE CASCADE"
        UUID reported_user_id FK "ON DELETE CASCADE"
        TEXT reason
        BOOLEAN is_resolved "DEFAULT FALSE"
        UUID resolved_by FK "ON DELETE SET NULL"
        TIMESTAMP resolved_at
    }

    users ||--o{ quizzes : "creates"
    quizzes ||--|{ quiz_questions : "includes"
    quiz_questions ||--|{ questions : "links_to"
    questions ||--o{ answers : "has"
    quizzes ||--o{ quiz_tags : "tagged_with"
    tags ||--|{ quiz_tags : "applied_to"
    users ||--o{ quiz_attempts : "makes"
    quizzes ||--o{ quiz_attempts : "attempted_in"
    quiz_attempts ||--|{ user_answers : "records"
    quiz_questions ||--|{ user_answers : "answers_for"
    answers --o{ user_answers : "selected"
    users ||--o{ reports : "submits"
    quizzes --o{ reports : "reported_as"
    users --o{ reports : "reported_as"
    users --o{ reports : "resolved_by"
```
