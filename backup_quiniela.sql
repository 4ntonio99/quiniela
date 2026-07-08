--
-- PostgreSQL database dump
--

\restrict Xztjna5h5wB9PfcQcXaR0gfTU4c0lv1puElioZzRnoT4hPpxoDNSceURVJplU1n

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: partidos; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.partidos (
    id integer NOT NULL,
    equipo_local character varying,
    equipo_visitante character varying,
    goles_local integer,
    goles_visitante integer,
    estadio character varying,
    horario character varying,
    fase character varying,
    grupo character varying,
    jugado boolean
);


ALTER TABLE public.partidos OWNER TO "user";

--
-- Name: partidos_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.partidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.partidos_id_seq OWNER TO "user";

--
-- Name: partidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.partidos_id_seq OWNED BY public.partidos.id;


--
-- Name: predicciones; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.predicciones (
    id integer NOT NULL,
    usuario_id integer,
    quiniela_id integer,
    partido_id integer,
    goles_local_pred integer,
    goles_visitante_pred integer
);


ALTER TABLE public.predicciones OWNER TO "user";

--
-- Name: predicciones_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.predicciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.predicciones_id_seq OWNER TO "user";

--
-- Name: predicciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.predicciones_id_seq OWNED BY public.predicciones.id;


--
-- Name: quinielas; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.quinielas (
    id integer NOT NULL,
    user_id integer,
    puntos integer,
    is_random boolean,
    is_approved boolean
);


ALTER TABLE public.quinielas OWNER TO "user";

--
-- Name: quinielas_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.quinielas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quinielas_id_seq OWNER TO "user";

--
-- Name: quinielas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.quinielas_id_seq OWNED BY public.quinielas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying,
    hashed_password character varying,
    is_admin boolean
);


ALTER TABLE public.usuarios OWNER TO "user";

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO "user";

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: partidos id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.partidos ALTER COLUMN id SET DEFAULT nextval('public.partidos_id_seq'::regclass);


--
-- Name: predicciones id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.predicciones ALTER COLUMN id SET DEFAULT nextval('public.predicciones_id_seq'::regclass);


--
-- Name: quinielas id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.quinielas ALTER COLUMN id SET DEFAULT nextval('public.quinielas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: partidos; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.partidos (id, equipo_local, equipo_visitante, goles_local, goles_visitante, estadio, horario, fase, grupo, jugado) FROM stdin;
2	República de Corea	Chequia	2	1	Estadio Guadalajara	11 de junio, 22:00	Grupos	Grupo A	t
3	Canadá	Bosnia y Herzegovina	1	1	Estadio Toronto	12 de junio, 15:00	Grupos	Grupo B	t
4	Estados Unidos	Paraguay	4	1	Estadio Los Ángeles	12 de junio, 21:00	Grupos	Grupo D	t
5	Catar	Suiza	1	1	Estadio Bahía de San Francisco	13 de junio, 15:00	Grupos	Grupo B	t
6	Brasil	Marruecos	1	1	Estadio Nueva York Nueva Jersey	13 de junio, 18:00	Grupos	Grupo C	t
7	Haití	Escocia	0	1	Estadio Boston	13 de junio, 21:00	Grupos	Grupo C	t
8	Australia	Turquía	2	0	Estadio BC Place Vancouver	14 de junio, 00:00	Grupos	Grupo D	t
9	Alemania	Curazao	1	0	Estadio Houston	14 de junio, 13:00	Grupos	Grupo E	t
10	Países Bajos	Japón	7	1	Estadio Dallas	14 de junio, 16:00	Grupos	Grupo F	t
11	Costa de Marfil	Ecuador	2	2	Estadio Filadelfia	14 de junio, 19:00	Grupos	Grupo E	t
12	Suecia	Túnez	5	1	Estadio Monterrey	14 de junio, 22:00	Grupos	Grupo F	t
13	España	Cabo Verde	1	1	Estadio Atlanta	15 de junio, 12:00	Grupos	Grupo H	t
14	Bélgica	Egipto	0	0	Estadio Seattle	15 de junio, 15:00	Grupos	Grupo G	t
15	Arabia Saudí	Uruguay	0	0	Estadio Miami	15 de junio, 18:00	Grupos	Grupo H	t
16	RI de Irán	Nueva Zelanda	1	1	Estadio Los Ángeles	15 de junio, 21:00	Grupos	Grupo G	t
17	Francia	Senegal	2	0	Estadio Nueva York Nueva Jersey	16 de junio, 15:00	Grupos	Grupo I	t
18	Irak	Noruega	0	3	Estadio Boston	16 de junio, 18:00	Grupos	Grupo I	t
19	Argentina	Argelia	2	1	Estadio Kansas City	16 de junio, 21:00	Grupos	Grupo J	t
20	Austria	Jordania	2	0	Estadio Bahía de San Francisco	17 de junio, 00:00	Grupos	Grupo J	t
21	Portugal	RD Congo	2	1	Estadio Houston	17 de junio, 13:00	Grupos	Grupo K	t
22	Inglaterra	Croacia	4	2	Estadio Dallas	17 de junio, 16:00	Grupos	Grupo L	t
23	Ghana	Panamá	1	0	Estadio Toronto	17 de junio, 19:00	Grupos	Grupo L	t
24	Uzbekistán	Colombia	0	1	Estadio Ciudad de México	17 de junio, 22:00	Grupos	Grupo K	t
25	República Checa	Sudáfrica	1	1	Estadio Atlanta	18 de junio, 12:00	Grupos	Grupo A	t
26	Suiza	Bosnia y Herzegovina	4	1	Estadio Los Ángeles	18 de junio, 15:00	Grupos	Grupo B	t
27	Canadá	Catar	6	0	Estadio BC Place Vancouver	18 de junio, 18:00	Grupos	Grupo B	t
28	México	República de Corea	1	0	Estadio Guadalajara	18 de junio, 21:00	Grupos	Grupo A	t
30	Escocia	Marruecos	0	1	Estadio Boston	19 de junio, 18:00	Grupos	Grupo C	t
31	Brasil	Haití	0	1	Estadio Filadelfia	19 de junio, 21:00	Grupos	Grupo C	t
32	Turquía	Paraguay	2	0	Estadio Bahía de San Francisco	20 de junio, 00:00	Grupos	Grupo D	t
33	Países Bajos	Suecia	2	1	Estadio Houston	20 de junio, 13:00	Grupos	Grupo F	t
34	Alemania	Costa de Marfil	0	0	Estadio Toronto	20 de junio, 16:00	Grupos	Grupo E	t
35	Ecuador	Curazao	5	1	Estadio Kansas City	20 de junio, 22:00	Grupos	Grupo E	t
36	Túnez	Japón	0	4	Estadio Monterrey	21 de junio, 00:00	Grupos	Grupo F	t
37	España	Arabia Saudí	2	0	Estadio Atlanta	21 de junio, 12:00	Grupos	Grupo H	t
38	Bélgica	Irán	2	2	Estadio Los Ángeles	21 de junio, 15:00	Grupos	Grupo G	t
39	Uruguay	Cabo Verde	2	0	Estadio Miami	21 de junio, 18:00	Grupos	Grupo H	t
40	Nueva Zelanda	Egipto	1	1	Estadio BC Place Vancouver	21 de junio, 21:00	Grupos	Grupo G	t
41	Argentina	Austria	2	1	Estadio Dallas	22 de junio, 13:00	Grupos	Grupo J	t
42	Francia	Irak	1	2	Estadio Filadelfia	22 de junio, 17:00	Grupos	Grupo I	t
43	Noruega	Senegal	2	0	Estadio Nueva York Nueva Jersey	22 de junio, 20:00	Grupos	Grupo I	t
44	Jordania	Argelia	2	2	Estadio Bahía de San Francisco	22 de junio, 23:00	Grupos	Grupo J	t
45	Portugal	Uzbekistán	2	0	Estadio Houston	23 de junio, 13:00	Grupos	Grupo K	t
46	Inglaterra	Ghana	1	1	Estadio Boston	23 de junio, 16:00	Grupos	Grupo L	t
47	Panamá	Croacia	2	0	Estadio Toronto	23 de junio, 19:00	Grupos	Grupo L	t
48	Colombia	RD Congo	1	1	Estadio Guadalajara	23 de junio, 22:00	Grupos	Grupo K	t
49	Suiza	Canadá	0	2	Estadio BC Place Vancouver	24 de junio, 13:00	Grupos	Grupo B	t
50	Bosnia y Herzegovina	Catar	1	1	Estadio Seattle	24 de junio, 13:00	Grupos	Grupo B	t
51	Escocia	Brasil	1	1	Estadio Miami	24 de junio, 16:00	Grupos	Grupo C	t
52	Marruecos	Haití	0	0	Estadio Atlanta	24 de junio, 16:00	Grupos	Grupo C	t
53	República Checa	México	1	1	Estadio Ciudad de México	24 de junio, 19:00	Grupos	Grupo A	t
54	Sudáfrica	República de Corea	3	1	Estadio Monterrey	24 de junio, 19:00	Grupos	Grupo A	t
55	Curazao	Costa de Marfil	2	1	Estadio Filadelfia	25 de junio, 14:00	Grupos	Grupo E	t
56	Ecuador	Alemania	3	1	Estadio Nueva York Nueva Jersey	25 de junio, 14:00	Grupos	Grupo E	t
57	Japón	Suecia	0	2	Estadio Dallas	25 de junio, 17:00	Grupos	Grupo F	t
58	Túnez	Países Bajos	3	1	Estadio Kansas City	25 de junio, 17:00	Grupos	Grupo F	t
59	Turquía	Estados Unidos	2	1	Estadio Los Ángeles	25 de junio, 20:00	Grupos	Grupo D	t
61	Noruega	Francia	1	0	Estadio Boston	26 de junio, 13:00	Grupos	Grupo I	t
62	Senegal	Irak	3	0	Estadio Toronto	26 de junio, 13:00	Grupos	Grupo I	t
63	Cabo Verde	Arabia Saudita	2	1	Estadio Houston	26 de junio, 18:00	Grupos	Grupo H	t
64	Uruguay	España	2	0	Estadio Guadalajara	26 de junio, 18:00	Grupos	Grupo H	t
65	Egipto	Irán	1	0	Estadio Seattle	26 de junio, 21:00	Grupos	Grupo G	t
66	Nueva Zelanda	Bélgica	2	2	Estadio BC Place Vancouver	26 de junio, 21:00	Grupos	Grupo G	t
67	Panamá	Inglaterra	0	3	Estadio Nueva York Nueva Jersey	27 de junio, 15:00	Grupos	Grupo L	t
86	Colombia	Austria	0	0	Estadio Miami	2 de julio, 20:00	16avos	N/A	f
87	Escocia	Suiza	0	0	Estadio Bahía de San Francisco	3 de julio, 15:00	16avos	N/A	f
88	Noruega	Argelia	0	0	Estadio Seattle	3 de julio, 18:00	16avos	N/A	f
89	Canadá	Marruecos	0	0	Estadio Filadelfia	4 de julio, 13:00	8avos	N/A	f
90	Paraguay	Francia	0	0	Estadio Houston	4 de julio, 17:00	8avos	N/A	f
91	Brasil	Noruega	0	0	Estadio Nueva York Nueva Jersey	5 de julio, 16:00	8avos	N/A	f
95	\N	\N	0	0	Estadio Atlanta	7 de julio, 12:00	8avos	N/A	f
96	\N	\N	0	0	Estadio Vancouver	7 de julio, 13:00	8avos	N/A	f
97	\N	\N	0	0	Estadio Los Ángeles	10 de julio, 13:00	4tos	N/A	f
98	\N	\N	0	0	Estadio Nueva York Nueva Jersey	10 de julio, 17:00	4tos	N/A	f
99	\N	\N	0	0	Estadio Miami	11 de julio, 13:00	4tos	N/A	f
100	\N	\N	0	0	Estadio Kansas City	11 de julio, 17:00	4tos	N/A	f
101	\N	\N	0	0	Estadio Atlanta	14 de julio, 14:00	Tercer	N/A	f
102	\N	\N	0	0	Estadio Dallas	15 de julio, 14:00	Semifinal	N/A	f
103	\N	\N	0	0	Estadio Dallas	15 de julio, 14:00	Semifinal	N/A	f
104	\N	\N	0	0	Estadio Nueva York Nueva Jersey	19 de julio, 12:00	Final	N/A	f
1	México	Sudáfrica	2	0	Estadio Ciudad de México	11 de junio, 15:00	Grupos	Grupo A	t
29	Estados Unidos	Australia	3	0	Estadio Seattle	19 de junio, 15:00	Grupos	Grupo D	t
60	Paraguay	Australia	4	0	Estadio Bahía de San Francisco	25 de junio, 20:00	Grupos	Grupo D	t
68	Croacia	Ghana	1	0	Estadio Filadelfia	27 de junio, 15:00	Grupos	Grupo L	t
69	Colombia	Portugal	2	1	Estadio Miami	27 de junio, 17:30	Grupos	Grupo K	t
70	RD Congo	Uzbekistán	2	0	Estadio Atlanta	27 de junio, 17:30	Grupos	Grupo K	t
71	Argelia	Austria	0	2	Estadio Kansas City	27 de junio, 20:00	Grupos	Grupo J	t
72	Jordania	Argentina	2	1	Estadio Dallas	27 de junio, 20:00	Grupos	Grupo J	t
73	México	República Checa	1	0	Estadio Ciudad de México	28 de junio, 15:00	16avos	N/A	t
74	Estados Unidos	Suecia	2	1	Estadio Los Ángeles	28 de junio, 18:00	16avos	N/A	t
75	Brasil	Australia	1	1	Estadio Nueva York Nueva Jersey	29 de junio, 14:00	16avos	N/A	t
76	Países Bajos	Paraguay	1	1	Estadio Filadelfia	29 de junio, 17:00	16avos	N/A	t
77	Argentina	RD Congo	1	2	Estadio Dallas	29 de junio, 20:00	16avos	N/A	t
78	Francia	Cabo Verde	3	0	Estadio Atlanta	30 de junio, 14:00	16avos	N/A	t
79	Alemania	Japón	2	0	Estadio Toronto	30 de junio, 17:00	16avos	N/A	t
80	Inglaterra	Egipto	2	1	Estadio Boston	30 de junio, 20:00	16avos	N/A	t
81	España	Irán	3	2	Estadio Guadalajara	1 de julio, 14:00	16avos	N/A	t
82	Bélgica	Uruguay	2	0	Estadio Monterrey	1 de julio, 17:00	16avos	N/A	t
83	Portugal	Ghana	3	0	Estadio Houston	1 de julio, 20:00	16avos	N/A	t
84	Canadá	Marruecos	2	1	Estadio BC Place Vancouver	2 de julio, 14:00	16avos	N/A	t
85	Turquía	Costa de Marfil	2	0	Estadio Kansas City	2 de julio, 17:00	16avos	N/A	t
92	México	Inglaterra	2	3	Estadio Ciudad de México	5 de julio, 18:00	8avos	N/A	t
93	Portugal	España	0	1	Estadio Dallas	6 de julio, 14:00	8avos	N/A	t
94	Estados Unidos	Bélgica	4	2	Estadio Seattle	6 de julio, 17:00	8avos	N/A	t
\.


--
-- Data for Name: predicciones; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.predicciones (id, usuario_id, quiniela_id, partido_id, goles_local_pred, goles_visitante_pred) FROM stdin;
1	2	1	1	2	4
2	2	1	2	4	3
3	2	1	3	2	1
4	2	1	4	3	4
5	2	1	5	1	4
6	2	1	6	4	3
7	2	1	7	2	2
8	2	1	8	4	3
9	2	1	9	2	2
10	2	1	10	0	0
11	2	1	11	1	4
12	2	1	12	4	3
13	2	1	13	4	2
14	2	1	14	3	3
15	2	1	15	0	2
16	2	1	16	3	1
17	2	1	17	0	1
18	2	1	18	1	1
19	2	1	19	1	1
20	2	1	20	3	2
21	2	1	21	2	3
22	2	1	22	0	1
23	2	1	23	2	1
24	2	1	24	0	2
25	2	1	25	4	2
26	2	1	26	0	4
27	2	1	27	4	2
28	2	1	28	1	0
29	2	1	29	4	2
30	2	1	30	3	0
31	2	1	31	0	1
32	2	1	32	1	4
33	2	1	33	1	2
34	2	1	34	3	3
35	2	1	35	2	2
36	2	1	36	3	3
37	2	1	37	4	2
38	2	1	38	4	4
39	2	1	39	0	1
40	2	1	40	4	2
41	2	1	41	2	4
42	2	1	42	2	2
43	2	1	43	4	4
44	2	1	44	4	2
45	2	1	45	1	1
46	2	1	46	0	1
47	2	1	47	0	1
48	2	1	48	0	3
49	2	1	49	2	1
50	2	1	50	4	1
51	2	1	51	2	1
52	2	1	52	4	2
53	2	1	53	3	1
54	2	1	54	0	3
55	2	1	55	1	3
56	2	1	56	4	4
57	2	1	57	0	1
58	2	1	58	3	3
59	2	1	59	4	2
60	2	1	60	0	0
61	2	1	61	0	3
62	2	1	62	0	3
63	2	1	63	1	2
64	2	1	64	0	2
65	2	1	65	3	2
66	2	1	66	4	0
67	2	1	67	3	2
68	2	1	68	3	4
69	2	1	69	0	0
70	2	1	70	3	1
71	2	1	71	1	3
72	2	1	72	3	0
73	2	1	73	0	1
74	2	1	74	3	2
75	2	1	75	2	4
76	2	1	76	1	0
77	2	1	77	0	4
78	2	1	78	1	1
79	2	1	79	0	1
80	2	1	80	2	4
81	2	1	81	2	2
82	2	1	82	2	3
83	2	1	83	1	0
84	2	1	84	2	1
85	2	1	85	4	2
86	2	1	86	2	2
87	2	1	87	1	0
88	2	1	88	2	4
89	2	1	89	4	2
90	2	1	90	4	1
91	2	1	91	4	3
92	2	1	92	1	4
93	2	1	93	3	4
94	2	1	94	4	2
95	2	1	95	4	2
96	2	1	96	0	4
97	2	1	97	4	0
98	2	1	98	4	2
99	2	1	99	0	4
100	2	1	100	0	2
101	2	1	101	3	2
102	2	1	102	1	0
103	2	1	103	0	4
104	2	1	104	3	1
105	3	3	2	1	1
106	3	3	3	0	2
107	3	3	4	0	2
108	3	3	5	1	2
109	3	3	6	1	3
110	3	3	7	4	1
111	3	3	8	4	2
112	3	3	9	0	1
113	3	3	10	1	4
114	3	3	11	2	4
115	3	3	12	4	1
116	3	3	13	2	4
117	3	3	14	4	4
118	3	3	15	3	2
119	3	3	16	1	2
120	3	3	17	2	1
121	3	3	18	2	3
122	3	3	19	3	4
123	3	3	20	3	0
124	3	3	21	2	2
125	3	3	22	0	2
126	3	3	23	4	1
127	3	3	24	4	2
128	3	3	25	4	3
129	3	3	26	3	1
130	3	3	27	0	4
131	3	3	28	3	3
132	3	3	30	3	2
133	3	3	31	4	3
134	3	3	32	0	1
135	3	3	33	4	4
136	3	3	34	2	0
137	3	3	35	1	1
138	3	3	36	2	0
139	3	3	37	0	3
140	3	3	38	2	0
141	3	3	39	2	0
142	3	3	40	2	1
143	3	3	41	3	3
144	3	3	42	0	4
145	3	3	43	2	2
146	3	3	44	2	2
147	3	3	45	4	3
148	3	3	46	0	3
149	3	3	47	1	4
150	3	3	48	2	1
151	3	3	49	2	3
152	3	3	50	2	0
153	3	3	51	0	0
154	3	3	52	2	1
155	3	3	53	4	3
156	3	3	54	4	3
157	3	3	55	3	0
158	3	3	56	2	2
159	3	3	57	1	2
160	3	3	58	4	2
161	3	3	59	0	0
162	3	3	61	1	2
163	3	3	62	3	3
164	3	3	63	1	3
165	3	3	64	2	3
166	3	3	65	0	3
167	3	3	66	3	4
168	3	3	67	3	1
169	3	3	86	0	1
170	3	3	87	0	2
171	3	3	88	4	4
172	3	3	89	1	1
173	3	3	90	3	3
174	3	3	91	0	1
175	3	3	95	2	0
176	3	3	96	4	2
177	3	3	97	0	2
178	3	3	98	2	4
179	3	3	99	2	0
180	3	3	100	2	0
181	3	3	101	3	1
182	3	3	102	3	3
183	3	3	103	1	1
184	3	3	104	4	2
185	3	3	92	2	3
186	3	3	93	3	3
187	3	3	94	0	4
188	3	3	1	1	4
189	3	3	29	1	2
190	3	3	60	0	2
191	3	3	68	1	4
192	3	3	69	3	3
193	3	3	70	3	0
194	3	3	71	3	0
195	3	3	72	4	1
196	3	3	73	0	0
197	3	3	74	3	0
198	3	3	75	2	4
199	3	3	76	0	1
200	3	3	77	1	1
201	3	3	78	0	4
202	3	3	79	0	4
203	3	3	80	3	4
204	3	3	81	0	2
205	3	3	82	3	0
206	3	3	83	2	2
207	3	3	84	3	2
208	3	3	85	4	3
209	3	4	2	0	0
210	3	4	3	2	2
211	3	4	4	2	1
212	3	4	5	0	2
213	3	4	6	4	1
214	3	4	7	1	2
215	3	4	8	1	1
216	3	4	9	4	3
217	3	4	10	1	1
218	3	4	11	0	4
219	3	4	12	2	2
220	3	4	13	4	3
221	3	4	14	4	0
222	3	4	15	2	4
223	3	4	16	2	1
224	3	4	17	0	0
225	3	4	18	0	0
226	3	4	19	2	4
227	3	4	20	3	0
228	3	4	21	0	0
229	3	4	22	4	0
230	3	4	23	2	4
231	3	4	24	1	1
232	3	4	25	0	1
233	3	4	26	0	3
234	3	4	27	2	2
235	3	4	28	0	1
236	3	4	30	4	4
237	3	4	31	3	4
238	3	4	32	2	1
239	3	4	33	0	4
240	3	4	34	4	3
241	3	4	35	3	4
242	3	4	36	2	3
243	3	4	37	1	0
244	3	4	38	0	4
245	3	4	39	1	1
246	3	4	40	4	4
247	3	4	41	4	1
248	3	4	42	4	2
249	3	4	43	2	2
250	3	4	44	4	4
251	3	4	45	0	2
252	3	4	46	3	2
253	3	4	47	2	1
254	3	4	48	3	3
255	3	4	49	3	2
256	3	4	50	3	0
257	3	4	51	2	2
258	3	4	52	1	1
259	3	4	53	0	3
260	3	4	54	1	1
261	3	4	55	4	0
262	3	4	56	2	1
263	3	4	57	3	4
264	3	4	58	1	4
265	3	4	59	0	0
266	3	4	61	3	4
267	3	4	62	4	2
268	3	4	63	4	4
269	3	4	64	4	1
270	3	4	65	3	2
271	3	4	66	1	0
272	3	4	67	1	2
273	3	4	86	2	1
274	3	4	87	2	4
275	3	4	88	2	4
276	3	4	89	4	2
277	3	4	90	1	0
278	3	4	91	2	3
279	3	4	95	1	0
280	3	4	96	2	4
281	3	4	97	0	4
282	3	4	98	1	4
283	3	4	99	1	1
284	3	4	100	1	2
285	3	4	101	1	4
286	3	4	102	2	4
287	3	4	103	2	2
288	3	4	104	4	1
289	3	4	92	3	0
290	3	4	93	3	3
291	3	4	94	3	1
292	3	4	1	1	2
293	3	4	29	3	2
294	3	4	60	2	3
295	3	4	68	3	1
296	3	4	69	3	4
297	3	4	70	0	2
298	3	4	71	2	4
299	3	4	72	2	3
300	3	4	73	4	2
301	3	4	74	1	4
302	3	4	75	1	3
303	3	4	76	1	1
304	3	4	77	4	4
305	3	4	78	3	0
306	3	4	79	0	2
307	3	4	80	1	3
308	3	4	81	1	2
309	3	4	82	2	1
310	3	4	83	4	2
311	3	4	84	0	4
312	3	4	85	4	2
313	5	8	2	0	4
314	5	8	3	0	0
315	5	8	4	4	4
316	5	8	5	3	2
317	5	8	6	3	0
318	5	8	7	4	4
319	5	8	8	1	4
320	5	8	9	0	0
321	5	8	10	3	0
322	5	8	11	0	4
323	5	8	12	2	0
324	5	8	13	4	3
325	5	8	14	1	2
326	5	8	15	2	3
327	5	8	16	0	2
328	5	8	17	3	2
329	5	8	18	0	3
330	5	8	19	1	2
331	5	8	20	1	1
332	5	8	21	4	1
333	5	8	22	1	3
334	5	8	23	0	2
335	5	8	24	1	4
336	5	8	25	4	1
337	5	8	26	4	0
338	5	8	27	2	3
339	5	8	28	4	3
340	5	8	30	1	4
341	5	8	31	1	3
342	5	8	32	0	4
343	5	8	33	4	2
344	5	8	34	4	1
345	5	8	35	0	1
346	5	8	36	4	3
347	5	8	37	0	2
348	5	8	38	4	0
349	5	8	39	0	0
350	5	8	40	0	4
351	5	8	41	4	2
352	5	8	42	3	3
353	5	8	43	2	0
354	5	8	44	4	1
355	5	8	45	1	4
356	5	8	46	2	2
357	5	8	47	4	4
358	5	8	48	3	3
359	5	8	49	1	0
360	5	8	50	3	2
361	5	8	51	1	3
362	5	8	52	2	3
363	5	8	53	4	2
364	5	8	54	2	2
365	5	8	55	3	4
366	5	8	56	3	1
367	5	8	57	4	3
368	5	8	58	4	1
369	5	8	59	3	2
370	5	8	61	4	2
371	5	8	62	4	2
372	5	8	63	2	2
373	5	8	64	1	1
374	5	8	65	1	4
375	5	8	66	2	0
376	5	8	67	0	1
377	5	8	86	4	3
378	5	8	87	4	0
379	5	8	88	4	4
380	5	8	89	3	3
381	5	8	90	3	3
382	5	8	91	0	1
383	5	8	95	3	1
384	5	8	96	2	1
385	5	8	97	1	0
386	5	8	98	0	2
387	5	8	99	3	3
388	5	8	100	2	1
389	5	8	101	4	1
390	5	8	102	3	2
391	5	8	103	1	3
392	5	8	104	4	4
393	5	8	92	4	1
394	5	8	93	1	1
395	5	8	94	0	3
396	5	8	1	2	3
397	5	8	29	0	4
398	5	8	60	3	2
399	5	8	68	3	4
400	5	8	69	0	3
401	5	8	70	4	1
402	5	8	71	3	1
403	5	8	72	3	2
404	5	8	73	3	0
405	5	8	74	2	3
406	5	8	75	0	0
407	5	8	76	3	2
408	5	8	77	1	3
409	5	8	78	0	4
410	5	8	79	1	1
411	5	8	80	0	3
412	5	8	81	1	0
413	5	8	82	2	1
414	5	8	83	0	1
415	5	8	84	1	0
416	5	8	85	1	1
\.


--
-- Data for Name: quinielas; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.quinielas (id, user_id, puntos, is_random, is_approved) FROM stdin;
2	2	0	f	t
5	3	0	f	t
9	5	0	f	f
10	5	0	t	f
11	5	0	t	f
12	5	0	f	f
3	3	62	t	t
8	5	56	t	t
1	2	59	t	t
4	3	64	t	t
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.usuarios (id, username, hashed_password, is_admin) FROM stdin;
1	Admin	123	t
2	Toño	123	f
3	Dany	123	f
4	ej1	123	f
5	Melqui	1234	f
\.


--
-- Name: partidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.partidos_id_seq', 104, true);


--
-- Name: predicciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.predicciones_id_seq', 416, true);


--
-- Name: quinielas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.quinielas_id_seq', 12, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 5, true);


--
-- Name: partidos partidos_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_pkey PRIMARY KEY (id);


--
-- Name: predicciones predicciones_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.predicciones
    ADD CONSTRAINT predicciones_pkey PRIMARY KEY (id);


--
-- Name: quinielas quinielas_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.quinielas
    ADD CONSTRAINT quinielas_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ix_partidos_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_partidos_id ON public.partidos USING btree (id);


--
-- Name: ix_predicciones_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_predicciones_id ON public.predicciones USING btree (id);


--
-- Name: ix_quinielas_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_quinielas_id ON public.quinielas USING btree (id);


--
-- Name: ix_usuarios_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_usuarios_id ON public.usuarios USING btree (id);


--
-- Name: ix_usuarios_username; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX ix_usuarios_username ON public.usuarios USING btree (username);


--
-- Name: predicciones predicciones_partido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.predicciones
    ADD CONSTRAINT predicciones_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES public.partidos(id);


--
-- Name: predicciones predicciones_quiniela_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.predicciones
    ADD CONSTRAINT predicciones_quiniela_id_fkey FOREIGN KEY (quiniela_id) REFERENCES public.quinielas(id);


--
-- Name: predicciones predicciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.predicciones
    ADD CONSTRAINT predicciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: quinielas quinielas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.quinielas
    ADD CONSTRAINT quinielas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Xztjna5h5wB9PfcQcXaR0gfTU4c0lv1puElioZzRnoT4hPpxoDNSceURVJplU1n

