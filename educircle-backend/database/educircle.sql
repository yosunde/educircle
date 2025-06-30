--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.2

-- Started on 2025-06-30 03:03:48

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 239 (class 1255 OID 24605)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 24624)
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    teacher_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    course_code character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24623)
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 219
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- TOC entry 232 (class 1259 OID 24753)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    group_id integer NOT NULL,
    uploader_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_type character varying(50),
    file_size_kb integer,
    description text,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    teacher_grade numeric(5,2),
    teacher_notes text,
    graded_by_teacher_id integer,
    graded_at timestamp with time zone
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 24752)
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO postgres;

--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 231
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- TOC entry 234 (class 1259 OID 24781)
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    user_id integer,
    course_id integer,
    enrolled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24780)
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO postgres;

--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 233
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- TOC entry 230 (class 1259 OID 24733)
-- Name: group_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_members (
    id integer NOT NULL,
    group_id integer NOT NULL,
    student_id integer NOT NULL,
    joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.group_members OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24732)
-- Name: group_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.group_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_members_id_seq OWNER TO postgres;

--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 229
-- Name: group_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.group_members_id_seq OWNED BY public.group_members.id;


--
-- TOC entry 228 (class 1259 OID 24709)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    project_id integer NOT NULL,
    creator_id integer NOT NULL,
    name character varying(255) NOT NULL,
    group_code character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24708)
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO postgres;

--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 227
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- TOC entry 238 (class 1259 OID 24817)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50),
    message text,
    link text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 24816)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 3534 (class 0 OID 0)
-- Dependencies: 237
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 236 (class 1259 OID 24801)
-- Name: password_reset_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_codes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    code character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_codes OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 24800)
-- Name: password_reset_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_codes_id_seq OWNER TO postgres;

--
-- TOC entry 3535 (class 0 OID 0)
-- Dependencies: 235
-- Name: password_reset_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_codes_id_seq OWNED BY public.password_reset_codes.id;


--
-- TOC entry 224 (class 1259 OID 24664)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    course_id integer NOT NULL,
    teacher_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_code character varying(50) NOT NULL,
    due_date timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24663)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- TOC entry 3536 (class 0 OID 0)
-- Dependencies: 223
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 222 (class 1259 OID 24644)
-- Name: student_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_courses (
    id integer NOT NULL,
    student_id integer NOT NULL,
    course_id integer NOT NULL,
    enrolled_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_courses OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24643)
-- Name: student_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_courses_id_seq OWNER TO postgres;

--
-- TOC entry 3537 (class 0 OID 0)
-- Dependencies: 221
-- Name: student_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_courses_id_seq OWNED BY public.student_courses.id;


--
-- TOC entry 226 (class 1259 OID 24689)
-- Name: student_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_projects (
    id integer NOT NULL,
    student_id integer NOT NULL,
    project_id integer NOT NULL,
    joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_projects OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24688)
-- Name: student_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_projects_id_seq OWNER TO postgres;

--
-- TOC entry 3538 (class 0 OID 0)
-- Dependencies: 225
-- Name: student_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_projects_id_seq OWNED BY public.student_projects.id;


--
-- TOC entry 218 (class 1259 OID 24607)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    school_number character varying(50) NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['teacher'::character varying, 'student'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24606)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3539 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3264 (class 2604 OID 24627)
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- TOC entry 3281 (class 2604 OID 24756)
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- TOC entry 3283 (class 2604 OID 24784)
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- TOC entry 3279 (class 2604 OID 24736)
-- Name: group_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members ALTER COLUMN id SET DEFAULT nextval('public.group_members_id_seq'::regclass);


--
-- TOC entry 3276 (class 2604 OID 24712)
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- TOC entry 3288 (class 2604 OID 24820)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3285 (class 2604 OID 24804)
-- Name: password_reset_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_codes ALTER COLUMN id SET DEFAULT nextval('public.password_reset_codes_id_seq'::regclass);


--
-- TOC entry 3270 (class 2604 OID 24667)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 3268 (class 2604 OID 24647)
-- Name: student_courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses ALTER COLUMN id SET DEFAULT nextval('public.student_courses_id_seq'::regclass);


--
-- TOC entry 3274 (class 2604 OID 24692)
-- Name: student_projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_projects ALTER COLUMN id SET DEFAULT nextval('public.student_projects_id_seq'::regclass);


--
-- TOC entry 3261 (class 2604 OID 24610)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3505 (class 0 OID 24624)
-- Dependencies: 220
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, teacher_id, name, description, course_code, is_active, created_at, updated_at) FROM stdin;
1	1	Web Programlama Temelleri	HTML, CSS, JavaScript ve Frontend Geliştirme dersleri.	WEB101	t	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
2	1	Veritabanı Yönetim Sistemleri	PostgreSQL ile SQL ve veritabanı tasarımı dersleri.	DB201	t	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
3	4	Nesne Yönelimli Programlama	Java ile OOP prensipleri ve uygulama geliştirme.	OOP301	t	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
8	1	Graduation Thesis	Mezuniyet projesi	P428WZ	t	2025-06-20 21:35:49.73779+00	2025-06-20 21:35:58.103129+00
9	1	Data Science		BS3RWA	t	2025-06-27 21:17:29.481913+00	2025-06-27 21:17:29.481913+00
11	8	GRADUATION THESIS	This is a course which students write their graduation thesis.	FLRK72	t	2025-06-29 20:02:43.340454+00	2025-06-29 21:05:00.114409+00
\.


--
-- TOC entry 3517 (class 0 OID 24753)
-- Dependencies: 232
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, group_id, uploader_id, file_name, file_path, file_type, file_size_kb, description, uploaded_at, teacher_grade, teacher_notes, graded_by_teacher_id, graded_at) FROM stdin;
1	1	2	WebSitesiTaslak.zip	https://example.com/files/frontend_ustalari_taslak.zip	application/zip	1500	Kişisel web sitesi projesi ilk taslak dosyaları.	2025-06-16 17:04:31.399541+00	\N	\N	\N	\N
2	1	3	CSS_Ipuclari.pdf	https://example.com/files/css_ipuclari.pdf	application/pdf	500	Kişisel web sitesi için CSS ipuçları belgesi.	2025-06-16 17:04:31.399541+00	85.50	CSS kullanımı başarılı, responsive tasarımda iyileşmeler yapılabilir.	1	2025-06-16 17:04:31.399541+00
3	3	2	OkulDB_ERD.png	https://example.com/files/okuldb_erd.png	image/png	800	Okul veritabanı ERD çizimi.	2025-06-16 17:04:31.399541+00	92.00	Detaylı ve mantıklı bir ERD.	1	2025-06-16 17:04:31.399541+00
4	4	5	BankaUyg_Kod_v1.zip	https://example.com/files/banka_uyg_v1.zip	application/zip	5000	Banka uygulaması projesi ilk kod sürümü.	2025-06-16 17:04:31.399541+00	78.00	Temel fonksiyonlar çalışıyor, hata yönetimine odaklanın.	4	2025-06-16 17:04:31.399541+00
6	6	6	GitHub Link	https://github.com/yosunde	github_link	\N		2025-06-28 00:00:58.690709+00	77.50		1	2025-06-28 18:20:42.409976+00
8	6	5	report analysis and design of user interface.docx	uploads/1751159003860-930176775-report analysis and design of user interface.docx	project_report	284		2025-06-29 01:03:23.885529+00	\N	\N	\N	\N
10	8	7	GitHub Link	https://github.com/yosunde/educircle	github_link	\N	github link of the project	2025-06-29 21:24:21.439568+00	100.00	Thank you!	8	2025-06-29 21:44:43.570892+00
11	8	7	EduCircle.logo.png	uploads/1751232286481-2339869-EduCircle.logo.png	project_photos	244	photos	2025-06-29 21:24:46.490555+00	100.00	Thank you!	8	2025-06-29 21:44:43.570892+00
12	8	7	report analysis and design of user interface.docx	uploads/1751232311784-77296410-report analysis and design of user interface.docx	project_report	284	report	2025-06-29 21:25:11.790801+00	100.00	Thank you!	8	2025-06-29 21:44:43.570892+00
13	8	7	main.pdf	uploads/1751232375229-755910852-main.pdf	presentation_video	236		2025-06-29 21:26:15.234602+00	100.00	Thank you!	8	2025-06-29 21:44:43.570892+00
14	8	7	main.pdf	uploads/1751232382622-559337302-main.pdf	project_schedule	236		2025-06-29 21:26:22.625306+00	100.00	Thank you!	8	2025-06-29 21:44:43.570892+00
15	8	7	main.pdf	uploads/1751232394540-276841048-main.pdf	code_docs	236		2025-06-29 21:26:34.547218+00	100.00	Thank you!	8	2025-06-29 21:44:43.570892+00
\.


--
-- TOC entry 3519 (class 0 OID 24781)
-- Dependencies: 234
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, user_id, course_id, enrolled_at, completed_at) FROM stdin;
\.


--
-- TOC entry 3515 (class 0 OID 24733)
-- Dependencies: 230
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_members (id, group_id, student_id, joined_at) FROM stdin;
1	1	2	2025-06-16 17:04:31.399541+00
2	1	3	2025-06-16 17:04:31.399541+00
3	2	3	2025-06-16 17:04:31.399541+00
4	2	2	2025-06-16 17:04:31.399541+00
5	3	2	2025-06-16 17:04:31.399541+00
6	4	5	2025-06-16 17:04:31.399541+00
7	5	6	2025-06-27 20:49:23.553173+00
8	3	6	2025-06-27 21:09:40.121792+00
9	6	6	2025-06-27 21:19:07.966082+00
10	6	5	2025-06-27 21:20:49.30791+00
11	7	2	2025-06-28 15:35:23.43614+00
12	8	7	2025-06-29 21:18:17.708969+00
13	8	6	2025-06-29 21:38:19.132026+00
\.


--
-- TOC entry 3513 (class 0 OID 24709)
-- Dependencies: 228
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, project_id, creator_id, name, group_code, description, created_at, updated_at) FROM stdin;
1	1	2	Frontend Ustaları	FWG001	Kişisel Web Sitesi projesi için frontend odaklı grup.	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
2	1	3	Tasarım Gurmeleri	DG002	Kişisel Web Sitesi projesi için UI/UX odaklı grup.	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
3	2	2	DB Sihirbazları	DBW003	Okul Veritabanı Tasarımı projesi için DB grubu.	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
4	3	5	Java Takımı	JT004	Banka Uygulaması Simülasyonu projesi için Java geliştirme grubu.	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
5	4	6	mezunlar 	HPHBSE		2025-06-27 20:49:23.540752+00	2025-06-27 20:49:23.540752+00
6	5	6	Data Survivors	G108RP		2025-06-27 21:19:07.956052+00	2025-06-27 21:19:07.956052+00
7	4	2	tez çalışması	3YEAKV		2025-06-28 15:35:23.432062+00	2025-06-28 15:35:23.432062+00
8	7	7	NewGroup	CT2K82		2025-06-29 21:18:17.697881+00	2025-06-29 21:18:17.697881+00
\.


--
-- TOC entry 3523 (class 0 OID 24817)
-- Dependencies: 238
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, message, link, is_read, created_at) FROM stdin;
1	2	grade	Grubunuza öğretmen tarafından not verildi!	/groups/7/student-detail	t	2025-06-28 18:19:32.617265
3	5	grade	Grubunuza öğretmen tarafından not verildi!	/groups/6/student-detail	f	2025-06-28 18:20:42.424673
4	2	announcement	Yeni kurs: "GRADUATION PROJECT" - Katılmak için kod: FLRK72	/courses/join	f	2025-06-29 20:02:43.353073
5	3	announcement	Yeni kurs: "GRADUATION PROJECT" - Katılmak için kod: FLRK72	/courses/join	f	2025-06-29 20:02:43.355719
6	5	announcement	Yeni kurs: "GRADUATION PROJECT" - Katılmak için kod: FLRK72	/courses/join	f	2025-06-29 20:02:43.357529
7	6	announcement	Yeni kurs: "GRADUATION PROJECT" - Katılmak için kod: FLRK72	/courses/join	f	2025-06-29 20:02:43.35917
9	7	grade	Grubunuza öğretmen tarafından not verildi!	/groups/8/student-detail	f	2025-06-29 21:44:43.582384
10	6	grade	Grubunuza öğretmen tarafından not verildi!	/groups/8/student-detail	f	2025-06-29 21:44:43.584594
\.


--
-- TOC entry 3521 (class 0 OID 24801)
-- Dependencies: 236
-- Data for Name: password_reset_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_codes (id, user_id, code, expires_at, used, created_at) FROM stdin;
5	6	804077	2025-06-28 20:53:49.082	t	2025-06-28 17:38:49.089941
6	7	408785	2025-06-29 22:43:36.79	f	2025-06-29 19:28:36.799447
\.


--
-- TOC entry 3509 (class 0 OID 24664)
-- Dependencies: 224
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, course_id, teacher_id, name, description, project_code, due_date, is_active, created_at, updated_at) FROM stdin;
1	1	1	Kişisel Web Sitesi	HTML, CSS ve JavaScript kullanarak basit bir kişisel web sitesi tasarlayın.	PWEB001	2025-07-15 20:59:59+00	t	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
2	2	1	Okul Veritabanı Tasarımı	Bir okul için varlık-ilişki diyagramı ve PostgreSQL veritabanı şeması taslağı.	PDB002	2025-07-20 20:59:59+00	t	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
3	3	4	Banka Uygulaması Simülasyonu	Java ile nesne yönelimli banka uygulaması geliştirin.	POOP003	2025-08-01 20:59:59+00	t	2025-06-16 17:04:31.399541+00	2025-06-16 17:04:31.399541+00
4	8	1	Graduation Thesis	You are going to your project reports to here. 	ZBXZWF	2025-06-30 00:00:00+00	t	2025-06-25 23:00:51.158598+00	2025-06-25 23:00:51.158598+00
5	9	1	Data Science Midterm Project	You can submit your midterm files to here	KU3E9X	2025-07-12 00:00:00+00	t	2025-06-27 21:18:35.438186+00	2025-06-27 21:18:35.438186+00
6	8	1	Report	Add your report to here	0KBA0I	2025-07-10 00:00:00+00	t	2025-06-28 15:16:48.32546+00	2025-06-28 15:16:48.32546+00
7	11	8	Graduation Thesis Report	You should submit your reports to the here. 	E5E9O7	2025-07-24 00:00:00+00	t	2025-06-29 21:06:52.858174+00	2025-06-29 21:06:52.858174+00
\.


--
-- TOC entry 3507 (class 0 OID 24644)
-- Dependencies: 222
-- Data for Name: student_courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_courses (id, student_id, course_id, enrolled_at) FROM stdin;
1	2	1	2025-06-16 17:04:31.399541+00
2	2	2	2025-06-16 17:04:31.399541+00
3	3	1	2025-06-16 17:04:31.399541+00
4	5	3	2025-06-16 17:04:31.399541+00
8	6	8	2025-06-20 21:56:51.404551+00
9	6	3	2025-06-20 21:58:57.094125+00
10	6	2	2025-06-20 22:00:48.260582+00
11	6	9	2025-06-27 21:17:58.727919+00
12	5	9	2025-06-27 21:20:29.941993+00
13	2	8	2025-06-28 15:27:41.223944+00
14	7	11	2025-06-29 21:14:19.011909+00
15	6	11	2025-06-29 21:33:47.14377+00
\.


--
-- TOC entry 3511 (class 0 OID 24689)
-- Dependencies: 226
-- Data for Name: student_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_projects (id, student_id, project_id, joined_at) FROM stdin;
1	2	1	2025-06-16 17:04:31.399541+00
2	3	1	2025-06-16 17:04:31.399541+00
3	2	2	2025-06-16 17:04:31.399541+00
4	5	3	2025-06-16 17:04:31.399541+00
5	6	4	2025-06-25 23:01:22.99608+00
6	6	2	2025-06-27 21:07:01.876083+00
7	6	5	2025-06-27 21:18:56.83907+00
8	5	5	2025-06-27 21:20:37.029333+00
9	2	6	2025-06-28 15:28:37.522102+00
10	2	4	2025-06-28 15:29:24.283197+00
11	7	7	2025-06-29 21:16:04.717328+00
12	6	7	2025-06-29 21:34:07.596144+00
\.


--
-- TOC entry 3503 (class 0 OID 24607)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role, first_name, last_name, created_at, updated_at, school_number) FROM stdin;
1	teacher_mert	mert.hoca@educircle.com	mert123	teacher	Mert	Yılmaz	2025-06-16 17:04:31.399541+00	2025-06-16 18:59:54.388315+00	2023001
2	student_ayse	ayse.ogrenci@educircle.com	ayse123	student	Ayşe	Demir	2025-06-16 17:04:31.399541+00	2025-06-16 18:59:54.388315+00	2023002
3	student_can	can.ogrenci@educircle.com	can123	student	Can	Kara	2025-06-16 17:04:31.399541+00	2025-06-16 18:59:54.388315+00	2023003
4	teacher_zeynep	zeynep.hoca@educircle.com	zeynep123	teacher	Zeynep	Aydın	2025-06-16 17:04:31.399541+00	2025-06-16 18:59:54.388315+00	2023004
5	student_elif	elif.ogrenci@educircle.com	elif123	student	Elif	Ak	2025-06-16 17:04:31.399541+00	2025-06-16 18:59:54.388315+00	2023005
6	sudee	sude.uysal.20022@gmail.com	12345678	student	Sevgi Sude	UYSAL	2025-06-17 22:49:58.119011+00	2025-06-28 17:39:35.800934+00	220209804
7	furkan	uysalfurkan2ujej@gmail.com	furkanuysal	student	furkan	uysal	2025-06-29 19:26:35.466771+00	2025-06-29 19:26:35.466771+00	230200013
8	esra	esra.uysal.1978@gmail.com	esrauysal	teacher	esra	UYSAL	2025-06-29 19:34:13.259989+00	2025-06-29 19:34:13.259989+00	1212121212
\.


--
-- TOC entry 3540 (class 0 OID 0)
-- Dependencies: 219
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 11, true);


--
-- TOC entry 3541 (class 0 OID 0)
-- Dependencies: 231
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_seq', 15, true);


--
-- TOC entry 3542 (class 0 OID 0)
-- Dependencies: 233
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 1, false);


--
-- TOC entry 3543 (class 0 OID 0)
-- Dependencies: 229
-- Name: group_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.group_members_id_seq', 13, true);


--
-- TOC entry 3544 (class 0 OID 0)
-- Dependencies: 227
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 8, true);


--
-- TOC entry 3545 (class 0 OID 0)
-- Dependencies: 237
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 10, true);


--
-- TOC entry 3546 (class 0 OID 0)
-- Dependencies: 235
-- Name: password_reset_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_codes_id_seq', 6, true);


--
-- TOC entry 3547 (class 0 OID 0)
-- Dependencies: 223
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 7, true);


--
-- TOC entry 3548 (class 0 OID 0)
-- Dependencies: 221
-- Name: student_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_courses_id_seq', 15, true);


--
-- TOC entry 3549 (class 0 OID 0)
-- Dependencies: 225
-- Name: student_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_projects_id_seq', 12, true);


--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- TOC entry 3301 (class 2606 OID 24636)
-- Name: courses courses_course_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_course_code_key UNIQUE (course_code);


--
-- TOC entry 3303 (class 2606 OID 24634)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3325 (class 2606 OID 24761)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 3327 (class 2606 OID 24787)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- TOC entry 3329 (class 2606 OID 24789)
-- Name: enrollments enrollments_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_course_id_key UNIQUE (user_id, course_id);


--
-- TOC entry 3321 (class 2606 OID 24741)
-- Name: group_members group_members_group_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_student_id_key UNIQUE (group_id, student_id);


--
-- TOC entry 3323 (class 2606 OID 24739)
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3317 (class 2606 OID 24720)
-- Name: groups groups_group_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_group_code_key UNIQUE (group_code);


--
-- TOC entry 3319 (class 2606 OID 24718)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 3335 (class 2606 OID 24826)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3333 (class 2606 OID 24808)
-- Name: password_reset_codes password_reset_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_codes
    ADD CONSTRAINT password_reset_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 3309 (class 2606 OID 24674)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 3311 (class 2606 OID 24676)
-- Name: projects projects_project_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_project_code_key UNIQUE (project_code);


--
-- TOC entry 3305 (class 2606 OID 24650)
-- Name: student_courses student_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3307 (class 2606 OID 24652)
-- Name: student_courses student_courses_student_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_student_id_course_id_key UNIQUE (student_id, course_id);


--
-- TOC entry 3313 (class 2606 OID 24695)
-- Name: student_projects student_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_pkey PRIMARY KEY (id);


--
-- TOC entry 3315 (class 2606 OID 24697)
-- Name: student_projects student_projects_student_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_student_id_project_id_key UNIQUE (student_id, project_id);


--
-- TOC entry 3293 (class 2606 OID 24621)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3295 (class 2606 OID 24617)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3297 (class 2606 OID 24779)
-- Name: users users_school_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_school_number_key UNIQUE (school_number);


--
-- TOC entry 3299 (class 2606 OID 24619)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3330 (class 1259 OID 24815)
-- Name: idx_password_reset_codes_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_codes_code ON public.password_reset_codes USING btree (code);


--
-- TOC entry 3331 (class 1259 OID 24814)
-- Name: idx_password_reset_codes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_codes_user_id ON public.password_reset_codes USING btree (user_id);


--
-- TOC entry 3354 (class 2620 OID 24642)
-- Name: courses update_course_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_course_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3356 (class 2620 OID 24731)
-- Name: groups update_group_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_group_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3355 (class 2620 OID 24687)
-- Name: projects update_project_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3353 (class 2620 OID 24622)
-- Name: users update_user_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3336 (class 2606 OID 24637)
-- Name: courses courses_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- TOC entry 3347 (class 2606 OID 24772)
-- Name: documents documents_graded_by_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_graded_by_teacher_id_fkey FOREIGN KEY (graded_by_teacher_id) REFERENCES public.users(id);


--
-- TOC entry 3348 (class 2606 OID 24762)
-- Name: documents documents_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- TOC entry 3349 (class 2606 OID 24767)
-- Name: documents documents_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.users(id);


--
-- TOC entry 3350 (class 2606 OID 24795)
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- TOC entry 3351 (class 2606 OID 24790)
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3345 (class 2606 OID 24742)
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


--
-- TOC entry 3346 (class 2606 OID 24747)
-- Name: group_members group_members_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- TOC entry 3343 (class 2606 OID 24726)
-- Name: groups groups_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- TOC entry 3344 (class 2606 OID 24721)
-- Name: groups groups_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 3352 (class 2606 OID 24809)
-- Name: password_reset_codes password_reset_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_codes
    ADD CONSTRAINT password_reset_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3339 (class 2606 OID 24677)
-- Name: projects projects_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- TOC entry 3340 (class 2606 OID 24682)
-- Name: projects projects_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id);


--
-- TOC entry 3337 (class 2606 OID 24658)
-- Name: student_courses student_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- TOC entry 3338 (class 2606 OID 24653)
-- Name: student_courses student_courses_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- TOC entry 3341 (class 2606 OID 24703)
-- Name: student_projects student_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 3342 (class 2606 OID 24698)
-- Name: student_projects student_projects_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_projects
    ADD CONSTRAINT student_projects_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


-- Completed on 2025-06-30 03:03:48

--
-- PostgreSQL database dump complete
--

