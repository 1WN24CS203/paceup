-- ====================================================================
-- PACEUP - PRODUCTION DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- "Every step counts. Every day levels you up."
-- Free, Open, Privacy-Focused Fitness Architecture
-- ====================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- Optional for advanced spatial queries

-- --------------------------------------------------------------------
-- 1. USER PROFILES
-- --------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    display_name text not null,
    avatar_url text,
    bio text default 'Lacing up and leveling up with PACEUP.',
    age integer check (age > 0 and age < 120),
    height_cm numeric(5,2),
    weight_kg numeric(5,2),
    fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced', 'elite')) default 'beginner',
    fitness_goal text check (fitness_goal in ('habit_building', 'weight_management', '5k_prep', '10k_prep', 'half_marathon', 'endurance')) default 'habit_building',
    weekly_goal_km numeric(6,2) default 15.0,
    daily_availability_min integer default 30,
    streak_count integer default 0,
    streak_freeze_count integer default 2,
    last_active_date date default current_date,
    xp integer default 0,
    level integer default 1,
    lifetime_distance_km numeric(10,2) default 0.0,
    lifetime_runs integer default 0,
    lifetime_duration_sec integer default 0,
    is_profile_private boolean default true,
    hide_location_radius_km numeric(3,2) default 0.5, -- Privacy zone around home
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone unless private"
    on public.profiles for select
    using (not is_profile_private or auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- --------------------------------------------------------------------
-- 2. ACTIVITIES (GPS RUNS, JOGS, WALKS)
-- --------------------------------------------------------------------
create table if not exists public.activities (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    activity_type text check (activity_type in ('walk', 'jog', 'run', 'interval', 'recovery_walk')) default 'jog',
    start_time timestamp with time zone default timezone('utc'::text, now()) not null,
    end_time timestamp with time zone default timezone('utc'::text, now()) not null,
    duration_sec integer not null check (duration_sec >= 0),
    distance_km numeric(6,3) not null check (distance_km >= 0),
    avg_pace_sec_per_km integer not null, -- Pace stored in seconds per km (e.g. 330 = 5:30 min/km)
    best_pace_sec_per_km integer,
    avg_speed_kmh numeric(5,2),
    calories_burned integer not null default 0,
    elevation_gain_m numeric(6,1) default 0,
    coordinates jsonb not null default '[]'::jsonb, -- Array of [{ lat, lng, altitude, timestamp, speed }]
    splits jsonb not null default '[]'::jsonb, -- Array of [{ kilometer, durationSec, paceSecPerKm, elevationChangeM }]
    notes text,
    visibility text check (visibility in ('private', 'friends', 'public')) default 'private',
    xp_earned integer default 0,
    cadence_avg integer,
    perceived_exertion integer check (perceived_exertion between 1 and 10),
    sync_status text default 'synced',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for lightning fast queries
create index if not exists idx_activities_user_id on public.activities(user_id);
create index if not exists idx_activities_start_time on public.activities(start_time desc);
create index if not exists idx_activities_visibility on public.activities(visibility);

-- RLS for Activities
alter table public.activities enable row level security;

create policy "Activities viewable based on visibility settings"
    on public.activities for select
    using (
        auth.uid() = user_id
        or visibility = 'public'
        or (visibility = 'friends' and exists (
            select 1 from public.friendships
            where (user_id = activities.user_id and friend_id = auth.uid() and status = 'accepted')
               or (friend_id = activities.user_id and user_id = auth.uid() and status = 'accepted')
        ))
    );

create policy "Users can insert their own activities"
    on public.activities for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own activities"
    on public.activities for update
    using (auth.uid() = user_id);

create policy "Users can delete their own activities"
    on public.activities for delete
    using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 3. ROUTES (DISCOVERY & CUSTOM USER ROUTES)
-- --------------------------------------------------------------------
create table if not exists public.routes (
    id uuid primary key default uuid_generate_v4(),
    creator_id uuid references public.profiles(id) on delete set null,
    title text not null,
    description text,
    distance_km numeric(6,2) not null,
    estimated_duration_min integer not null,
    difficulty text check (difficulty in ('easy', 'moderate', 'hard', 'challenging')) default 'moderate',
    surface text check (surface in ('paved', 'trail', 'track', 'mixed')) default 'paved',
    waypoints jsonb not null, -- Array of [{ lat, lng }]
    elevation_gain_m numeric(6,1) default 0,
    elevation_profile jsonb default '[]'::jsonb, -- Array of { distanceKm, elevationM }
    is_curated boolean default false,
    popularity_score integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.routes enable row level security;
create policy "Routes are viewable by all authenticated users"
    on public.routes for select
    using (true);

create policy "Users can create custom routes"
    on public.routes for insert
    with check (auth.uid() = creator_id);

-- --------------------------------------------------------------------
-- 4. SAVED USER ROUTES (FAVORITES)
-- --------------------------------------------------------------------
create table if not exists public.saved_routes (
    user_id uuid references public.profiles(id) on delete cascade not null,
    route_id uuid references public.routes(id) on delete cascade not null,
    personal_best_sec integer,
    saved_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, route_id)
);

alter table public.saved_routes enable row level security;
create policy "Users manage their own saved routes"
    on public.saved_routes for all
    using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 5. GAMIFICATION & ACHIEVEMENTS
-- --------------------------------------------------------------------
create table if not exists public.achievements (
    id text primary key,
    title text not null,
    description text not null,
    badge_icon text not null,
    category text check (category in ('distance', 'consistency', 'speed', 'special', 'milestone')) not null,
    xp_reward integer not null default 100,
    requirement_metric text not null,
    requirement_value numeric(10,2) not null
);

create table if not exists public.unlocked_achievements (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    achievement_id text references public.achievements(id) on delete cascade not null,
    unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, achievement_id)
);

alter table public.achievements enable row level security;
create policy "Achievements are viewable by all"
    on public.achievements for select using (true);

alter table public.unlocked_achievements enable row level security;
create policy "Users can view their unlocked achievements"
    on public.unlocked_achievements for select using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 6. DAILY MISSIONS / QUESTS
-- --------------------------------------------------------------------
create table if not exists public.daily_missions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    date date default current_date not null,
    title text not null,
    description text not null,
    target_metric text not null, -- 'steps', 'distance_km', 'duration_min', 'jog_session'
    target_value numeric(8,2) not null,
    current_value numeric(8,2) default 0,
    xp_reward integer not null default 50,
    is_completed boolean default false,
    is_claimed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.daily_missions enable row level security;
create policy "Users manage their daily missions"
    on public.daily_missions for all using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 7. SOCIAL COMMUNITY (KUDOS, COMMENTS, CLUBS, FEED)
-- --------------------------------------------------------------------
create table if not exists public.activity_kudos (
    user_id uuid references public.profiles(id) on delete cascade not null,
    activity_id uuid references public.activities(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, activity_id)
);

create table if not exists public.activity_comments (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    activity_id uuid references public.activities(id) on delete cascade not null,
    message text not null check (char_length(trim(message)) > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.running_clubs (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    description text,
    avatar_url text,
    location text,
    weekly_distance_goal_km numeric(8,2) default 200,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.club_memberships (
    club_id uuid references public.running_clubs(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (club_id, user_id)
);

create table if not exists public.friendships (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    friend_id uuid references public.profiles(id) on delete cascade not null,
    status text check (status in ('pending', 'accepted', 'rejected', 'blocked')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, friend_id)
);

alter table public.activity_kudos enable row level security;
create policy "Kudos viewable by all" on public.activity_kudos for select using (true);
create policy "Users can give kudos" on public.activity_kudos for insert with check (auth.uid() = user_id);
create policy "Users can remove kudos" on public.activity_kudos for delete using (auth.uid() = user_id);

alter table public.activity_comments enable row level security;
create policy "Comments viewable by all" on public.activity_comments for select using (true);
create policy "Users can post comments" on public.activity_comments for insert with check (auth.uid() = user_id);

alter table public.running_clubs enable row level security;
create policy "Clubs viewable by all" on public.running_clubs for select using (true);
alter table public.club_memberships enable row level security;
create policy "Memberships viewable by all" on public.club_memberships for select using (true);
create policy "Users join clubs" on public.club_memberships for insert with check (auth.uid() = user_id);
create policy "Users leave clubs" on public.club_memberships for delete using (auth.uid() = user_id);

alter table public.friendships enable row level security;
create policy "Users view their friendships" on public.friendships for select
    using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users manage their friendships" on public.friendships for all
    using (auth.uid() = user_id or auth.uid() = friend_id);

-- --------------------------------------------------------------------
-- 8. HEALTH & RECOVERY LOGS
-- --------------------------------------------------------------------
create table if not exists public.recovery_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    log_date date default current_date not null,
    readiness_score integer check (readiness_score between 0 and 100),
    sleep_duration_hours numeric(4,2),
    sleep_quality integer check (sleep_quality between 1 and 5),
    energy_rating integer check (energy_rating between 1 and 5),
    muscle_soreness_areas jsonb default '[]'::jsonb, -- ['calves', 'quads', 'hamstrings', 'glutes', 'shins']
    hydration_glasses integer default 0,
    coach_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, log_date)
);

alter table public.recovery_logs enable row level security;
create policy "Users manage their recovery logs" on public.recovery_logs for all using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 9. AI TRAINING PLANS
-- --------------------------------------------------------------------
create table if not exists public.training_plans (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    plan_name text not null,
    current_week integer default 1,
    total_weeks integer default 4,
    schedule jsonb not null, -- Array of 7 days per week with { day, type, targetDurationMin, targetDistanceKm, description, isRestDay, isCompleted }
    adaptation_notes text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.training_plans enable row level security;
create policy "Users manage their training plans" on public.training_plans for all using (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 10. DATABASE TRIGGERS: AUTO-UPDATE LIFETIME STATS & XP
-- --------------------------------------------------------------------
create or replace function public.handle_activity_completed()
returns trigger as $$
declare
    v_xp_earned integer;
begin
    -- Calculate base XP: 50 XP per km + 10 XP per 5 mins
    v_xp_earned := cast((new.distance_km * 50) + (new.duration_sec / 300 * 10) as integer);
    new.xp_earned := v_xp_earned;

    -- Update User profile lifetime metrics
    update public.profiles
    set 
        lifetime_distance_km = lifetime_distance_km + new.distance_km,
        lifetime_runs = lifetime_runs + 1,
        lifetime_duration_sec = lifetime_duration_sec + new.duration_sec,
        xp = xp + v_xp_earned,
        level = floor(sqrt((xp + v_xp_earned) / 250)) + 1,
        last_active_date = current_date,
        updated_at = timezone('utc'::text, now())
    where id = new.user_id;

    return new;
end;
$$ language plpgsql security definer;

create or replace trigger tr_activity_completed
before insert on public.activities
for each row execute function public.handle_activity_completed();

