export interface AvatarOption {
  id: string;
  label: string;
  category: string;
  url: string;
}

export const AVATAR_CATEGORIES = [
  'Todos',
  'Robots & Cyber',
  'Aventureros & Fantasía',
  'Anime & Arte',
  'Estudiantes & Estilos',
  'Emojis & Caras',
  'Pixel Art & Retro',
  'Monstruos & Criaturas',
  'Minimal & Geeks',
] as const;

export const AVATAR_OPTIONS: AvatarOption[] = [
  // ----------------------------------------------------
  // ROBOTS & CYBER (16)
  // ----------------------------------------------------
  { id: 'bot_amber', label: 'Robot Ámbar', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AmberBot&colors=amber' },
  { id: 'bot_cyber', label: 'Cyber Spark', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberSpark' },
  { id: 'bot_alpha', label: 'Alpha Math', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlphaMath' },
  { id: 'bot_nova', label: 'Nova Glow', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NovaGlow' },
  { id: 'bot_pixel', label: 'Pixel Tutor', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelTutor' },
  { id: 'bot_titan', label: 'Titan Calculus', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TitanCalculus' },
  { id: 'bot_mecha', label: 'Mecha Quantum', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MechaQuantum' },
  { id: 'bot_cosmo', label: 'Cosmo Unit', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CosmoUnit' },
  { id: 'bot_omega', label: 'Omega Core', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=OmegaCore' },
  { id: 'bot_volt', label: 'Volt Sentinel', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=VoltSentinel' },
  { id: 'bot_echo', label: 'Echo AI', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EchoAI' },
  { id: 'bot_circuit', label: 'Circuit Master', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CircuitMaster' },
  { id: 'bot_neon', label: 'Neon Android', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonAndroid' },
  { id: 'bot_matrix', label: 'Matrix Droid', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MatrixDroid' },
  { id: 'bot_turbo', label: 'Turbo Gear', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TurboGear' },
  { id: 'bot_gizmo', label: 'Gizmo Pulse', category: 'Robots & Cyber', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GizmoPulse' },

  // ----------------------------------------------------
  // AVENTUREROS & FANTASÍA (16)
  // ----------------------------------------------------
  { id: 'adv_leo', label: 'Leo Explorador', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LeoMath' },
  { id: 'adv_maya', label: 'Maya Aventurera', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MayaExplorer' },
  { id: 'adv_sam', label: 'Sam Sabio', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SamScholar' },
  { id: 'adv_lucas', label: 'Lucas Ingenio', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LucasClever' },
  { id: 'adv_elena', label: 'Elena Astuta', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ElenaSmart' },
  { id: 'adv_alex', label: 'Alex Aventuras', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexAdventure' },
  { id: 'adv_valkyrie', label: 'Valquiria Math', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ValkyrieHero' },
  { id: 'adv_ninja', label: 'Ninja Silencioso', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MathNinjaShadow' },
  { id: 'adv_wizard', label: 'Mago Arcano', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ArcaneMage' },
  { id: 'adv_knight', label: 'Caballero Dorado', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GoldenKnight' },
  { id: 'adv_ranger', label: 'Arquero Forestal', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ForestRanger' },
  { id: 'adv_sorcerer', label: 'Hechicera Estelar', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=StarSorceress' },
  { id: 'adv_captain', label: 'Capitán Estelar', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=StarCaptain' },
  { id: 'adv_alchemist', label: 'Alquimista Pro', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlchemistFormulas' },
  { id: 'adv_bard', label: 'Bardo Creativo', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CreativeBard' },
  { id: 'adv_paladin', label: 'Paladín Guardián', category: 'Aventureros & Fantasía', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GuardianPaladin' },

  // ----------------------------------------------------
  // ANIME & ARTE (16)
  // ----------------------------------------------------
  { id: 'lor_yuki', label: 'Yuki Shonen', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=YukiShonen' },
  { id: 'lor_sakura', label: 'Sakura Hana', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=SakuraHana' },
  { id: 'lor_kenji', label: 'Kenji Táctico', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=KenjiTactical' },
  { id: 'lor_akira', label: 'Akira Speed', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AkiraSpeed' },
  { id: 'lor_hina', label: 'Hina Brillante', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=HinaGlow' },
  { id: 'lor_ren', label: 'Ren Estratega', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=RenStrategy' },
  { id: 'lor_aoi', label: 'Aoi Azul', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AoiSky' },
  { id: 'lor_sora', label: 'Sora Cielo', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=SoraHorizon' },
  { id: 'lor_chiyo', label: 'Chiyo Estudiante', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ChiyoStudent' },
  { id: 'lor_daiki', label: 'Daiki Campeón', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=DaikiChampion' },
  { id: 'lor_emi', label: 'Emi Genio', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=EmiGenius' },
  { id: 'lor_kaito', label: 'Kaito Aventurero', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=KaitoAdventure' },
  { id: 'lor_naoki', label: 'Naoki Hacker', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=NaokiHacker' },
  { id: 'lor_rei', label: 'Rei Mente Clara', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ReiClearMind' },
  { id: 'lor_shin', label: 'Shin Fuego', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ShinFlame' },
  { id: 'lor_yuna', label: 'Yuna Mística', category: 'Anime & Arte', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=YunaMystic' },

  // ----------------------------------------------------
  // ESTUDIANTES & ESTILOS (16)
  // ----------------------------------------------------
  { id: 'av_mateo', label: 'Mateo Gafas', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MateoSmart' },
  { id: 'av_sofia', label: 'Sofía Estilos', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SofiaStyle' },
  { id: 'av_diego', label: 'Diego Gamer', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DiegoGamer' },
  { id: 'av_lucia', label: 'Lucía Creativa', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LuciaArt' },
  { id: 'av_carlos', label: 'Carlos Lector', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosReader' },
  { id: 'av_valentina', label: 'Valentina Líder', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ValentinaLeader' },
  { id: 'av_gabriel', label: 'Gabriel Científico', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GabrielScience' },
  { id: 'av_isabella', label: 'Isabella Curiosa', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IsabellaCurious' },
  { id: 'av_marcos', label: 'Marcos Deportivo', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcosSport' },
  { id: 'av_claudia', label: 'Claudia Enfoque', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ClaudiaFocus' },
  { id: 'av_javier', label: 'Javier Música', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JavierMusic' },
  { id: 'av_natalia', label: 'Natalia Cálculo', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NataliaCalculus' },
  { id: 'av_hugo', label: 'Hugo Ingeniero', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HugoEngineer' },
  { id: 'av_emma', label: 'Emma Espacio', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaSpace' },
  { id: 'av_adrian', label: 'Adrián Códigos', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdrianCode' },
  { id: 'av_paula', label: 'Paula Victoria', category: 'Estudiantes & Estilos', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PaulaVictory' },

  // ----------------------------------------------------
  // EMOJIS & CARAS (16)
  // ----------------------------------------------------
  { id: 'fun_wizard', label: 'Mago Números', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=MathWizard' },
  { id: 'fun_nerd', label: 'Científico Loco', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ScienceBrain' },
  { id: 'fun_cool', label: 'Gafas de Sol', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=CoolMathematician' },
  { id: 'fun_rocket', label: 'Astronauta', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=RocketMath' },
  { id: 'fun_champ', label: 'Campeón Dorado', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=GoldChampion' },
  { id: 'fun_blaze', label: 'Fuego Épico', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=FireBlaze' },
  { id: 'fun_mindblown', label: 'Cerebro Máximo', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=MindBlownIdea' },
  { id: 'fun_party', label: 'Fiesta Matemáticas', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=MathPartyTime' },
  { id: 'smile_zen', label: 'Modo Zen', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=ZenMind' },
  { id: 'smile_energy', label: 'Energía Total', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=EnergyHigh' },
  { id: 'smile_victory', label: 'Victoria Sonrisa', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=VictoryGoal' },
  { id: 'smile_focus', label: 'Enfoque Pro', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=FocusMaster' },
  { id: 'smile_curious', label: 'Curioso Feliz', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=CuriousExplorer' },
  { id: 'smile_prime', label: 'Número Primo', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=PrimeNumber' },
  { id: 'smile_super', label: 'Super Sonrisa', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=SuperSmileJoy' },
  { id: 'smile_radiant', label: 'Radiante', category: 'Emojis & Caras', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=RadiantPower' },

  // ----------------------------------------------------
  // PIXEL ART & RETRO (14)
  // ----------------------------------------------------
  { id: 'pix_hero', label: 'Héroe 8-Bit', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelHero8Bit' },
  { id: 'pix_mage', label: 'Mago Pixel', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelMageMagic' },
  { id: 'pix_rogue', label: 'Pícaro Retro', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroRogue' },
  { id: 'pix_warrior', label: 'Guerrero Arcade', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ArcadeWarrior' },
  { id: 'pix_healer', label: 'Curandero 16-Bit', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelHealer' },
  { id: 'pix_knight', label: 'Caballero Pixel', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Knight8Bit' },
  { id: 'pix_cyber', label: 'Cyberpunk Pixel', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberPixelHero' },
  { id: 'pix_ghost', label: 'Fantasma Retro', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroGhostGame' },
  { id: 'pix_alien', label: 'Alien Arcade', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ArcadeAlienShip' },
  { id: 'pix_ninja', label: 'Ninja 8-Bit', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NinjaPixelStrike' },
  { id: 'pix_princess', label: 'Princesa Pixel', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelPrincess' },
  { id: 'pix_robot', label: 'Bot Retro', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroRobot8' },
  { id: 'pix_dragon', label: 'Dragón Arcade', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ArcadeDragon' },
  { id: 'pix_wizard', label: 'Sabio Pixel', category: 'Pixel Art & Retro', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelSage' },

  // ----------------------------------------------------
  // MONSTRUOS & CRIATURAS (14)
  // ----------------------------------------------------
  { id: 'crood_fluffy', label: 'Peludo Mágico', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=FluffyMagic' },
  { id: 'crood_spooky', label: 'Fantasmín', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=SpookyDoodle' },
  { id: 'crood_cosmic', label: 'Ser Cósmico', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=CosmicCreature' },
  { id: 'crood_blob', label: 'Gota Alegre', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=HappyBlob' },
  { id: 'crood_dino', label: 'Dino Matemático', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=MathDino' },
  { id: 'crood_alien', label: 'Marciano Sabio', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=WiseAlien' },
  { id: 'crood_yeti', label: 'Yeti de las Nieves', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=SnowYeti' },
  { id: 'crood_golem', label: 'Golem de Piedra', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=StoneGolem' },
  { id: 'crood_kraken', label: 'Kraken Amigable', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=FriendlyKraken' },
  { id: 'crood_phoenix', label: 'Fénix Dorado', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=GoldenPhoenix' },
  { id: 'crood_griffin', label: 'Grifo Guardián', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=GriffinGuardian' },
  { id: 'crood_pixie', label: 'Hada de Luz', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=LightPixie' },
  { id: 'crood_shadow', label: 'Sombra Táctica', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=TacticalShadow' },
  { id: 'crood_starling', label: 'Estrella Viva', category: 'Monstruos & Criaturas', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=LivingStar' },

  // ----------------------------------------------------
  // MINIMAL & GEEKS (14)
  // ----------------------------------------------------
  { id: 'mic_albert', label: 'Albert Físico', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=AlbertPhysics' },
  { id: 'mic_ada', label: 'Ada Programadora', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=AdaProgrammer' },
  { id: 'mic_alan', label: 'Alan Algoritmo', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=AlanAlgorithm' },
  { id: 'mic_hypatia', label: 'Hipatia Sabia', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=HypatiaAlexandria' },
  { id: 'mic_euler', label: 'Euler Fórmulas', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=EulerMath' },
  { id: 'mic_gauss', label: 'Gauss Campana', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=GaussPrince' },
  { id: 'mic_newton', label: 'Newton Gravedad', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=NewtonGravity' },
  { id: 'mic_curie', label: 'Marie Laboratorio', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=MarieLab' },
  { id: 'mic_turing', label: 'Turing Código', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=TuringCode' },
  { id: 'mic_tesla', label: 'Tesla Rayo', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=TeslaLightning' },
  { id: 'mic_noether', label: 'Emmy Álgebra', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=EmmyAlgebra' },
  { id: 'mic_fermat', label: 'Fermat Teorema', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=FermatTheorem' },
  { id: 'mic_fibonacci', label: 'Fibonacci Espiral', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=FibonacciSpiral' },
  { id: 'mic_pythagoras', label: 'Pitágoras Triángulo', category: 'Minimal & Geeks', url: 'https://api.dicebear.com/7.x/micah/svg?seed=PythagorasTriangle' },
];
