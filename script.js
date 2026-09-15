// Web Audio API Sound Synthesizer
class SoundController {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('quizmaster_muted') === 'true';
        this.initAudioContext();
    }

    initAudioContext() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !this.ctx) {
            this.ctx = new AudioCtx();
        }
    }

    resumeAudio() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('quizmaster_muted', this.isMuted);
        return this.isMuted;
    }

    playCorrect() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';

            osc1.frequency.setValueAtTime(523.25, now); // C5
            osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
            osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

            osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
            osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now + 0.15);
            osc1.stop(now + 0.5);
            osc2.stop(now + 0.5);
        } catch (e) {
            console.warn('Audio playback error', e);
        }
    }

    playIncorrect() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {
            console.warn('Audio playback error', e);
        }
    }

    playTick() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);

            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.warn('Audio playback error', e);
        }
    }

    playClick() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {
            console.warn('Audio playback error', e);
        }
    }

    playVictory() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            const now = this.ctx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);

                gain.gain.setValueAtTime(0.12, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.4);
            });
        } catch (e) {
            console.warn('Audio playback error', e);
        }
    }
}

// Utility: Fisher-Yates (Knuth) Shuffle
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

class QuizApp {
    constructor() {
        this.userData = {
            name: '',
            age: 0,
            qualification: '',
            favoriteSubject: ''
        };
        this.quizData = {
            category: 'general',
            difficulty: 'easy',
            questionCount: 10,
            timerDuration: 60
        };
        this.questions = [];
        this.usedQuestionIds = new Set();
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.timer = null;
        this.skipTimer = null;
        this.questionTimeout = null;
        this.loadingInterval = null;
        this.timeRemaining = 0;
        this.skipTimeRemaining = 15;
        this.quizStartTime = null;
        this.totalQuizTime = 0;
        this.isAnswered = false;
        this.questionStartTime = null;
        this.sound = new SoundController();
        
        // Comprehensive Question Banks organized by Subject and Level
        this.questionBanks = {
            mathematics: {
                elementary: [
                    {id: 'math_elem_1', question: 'What is 2 + 3?', correct_answer: '5', incorrect_answers: ['4', '6', '7']},
                    {id: 'math_elem_2', question: 'What is 10 - 4?', correct_answer: '6', incorrect_answers: ['5', '7', '8']},
                    {id: 'math_elem_3', question: 'What is 3 × 2?', correct_answer: '6', incorrect_answers: ['4', '5', '8']},
                    {id: 'math_elem_4', question: 'What is 8 ÷ 2?', correct_answer: '4', incorrect_answers: ['2', '6', '8']},
                    {id: 'math_elem_5', question: 'What is 5 + 7?', correct_answer: '12', incorrect_answers: ['11', '13', '14']},
                    {id: 'math_elem_6', question: 'What is 9 - 3?', correct_answer: '6', incorrect_answers: ['5', '7', '12']},
                    {id: 'math_elem_7', question: 'What is 4 × 3?', correct_answer: '12', incorrect_answers: ['9', '15', '16']},
                    {id: 'math_elem_8', question: 'What is 15 ÷ 3?', correct_answer: '5', incorrect_answers: ['3', '6', '8']},
                    {id: 'math_elem_9', question: 'What is 6 + 4?', correct_answer: '10', incorrect_answers: ['8', '9', '11']},
                    {id: 'math_elem_10', question: 'What is 12 - 5?', correct_answer: '7', incorrect_answers: ['6', '8', '9']},
                    {id: 'math_elem_11', question: 'What is 7 × 2?', correct_answer: '14', incorrect_answers: ['12', '16', '18']},
                    {id: 'math_elem_12', question: 'What is 16 ÷ 4?', correct_answer: '4', incorrect_answers: ['2', '6', '8']},
                    {id: 'math_elem_13', question: 'What is 8 + 5?', correct_answer: '13', incorrect_answers: ['11', '12', '14']},
                    {id: 'math_elem_14', question: 'What is 14 - 6?', correct_answer: '8', incorrect_answers: ['6', '7', '9']},
                    {id: 'math_elem_15', question: 'What is 5 × 4?', correct_answer: '20', incorrect_answers: ['15', '18', '25']}
                ],
                middle: [
                    {id: 'math_mid_1', question: 'What is 15 × 4?', correct_answer: '60', incorrect_answers: ['56', '64', '72']},
                    {id: 'math_mid_2', question: 'What is 144 ÷ 12?', correct_answer: '12', incorrect_answers: ['10', '14', '16']},
                    {id: 'math_mid_3', question: 'What is 23 + 47?', correct_answer: '70', incorrect_answers: ['68', '69', '71']},
                    {id: 'math_mid_4', question: 'What is 85 - 37?', correct_answer: '48', incorrect_answers: ['46', '49', '52']},
                    {id: 'math_mid_5', question: 'What is 2³ (2 cubed)?', correct_answer: '8', incorrect_answers: ['6', '9', '12']},
                    {id: 'math_mid_6', question: 'What is the square root of 64?', correct_answer: '8', incorrect_answers: ['6', '7', '9']},
                    {id: 'math_mid_7', question: 'What is 15% of 80?', correct_answer: '12', incorrect_answers: ['10', '15', '16']},
                    {id: 'math_mid_8', question: 'What is 3/4 as a decimal?', correct_answer: '0.75', incorrect_answers: ['0.25', '0.5', '0.8']},
                    {id: 'math_mid_9', question: 'What is 25 × 8?', correct_answer: '200', incorrect_answers: ['180', '220', '240']},
                    {id: 'math_mid_10', question: 'What is 5² (5 squared)?', correct_answer: '25', incorrect_answers: ['20', '30', '35']},
                    {id: 'math_mid_11', question: 'What is the square root of 81?', correct_answer: '9', incorrect_answers: ['7', '8', '10']},
                    {id: 'math_mid_12', question: 'What is 20% of 150?', correct_answer: '30', incorrect_answers: ['25', '35', '40']}
                ],
                high: [
                    {id: 'math_high_1', question: 'What is the quadratic formula?', correct_answer: 'x = (-b ± √(b²-4ac)) / 2a', incorrect_answers: ['x = -b ± √(b²-4ac)', 'x = (-b ± √(b²+4ac)) / 2a', 'x = (b ± √(b²-4ac)) / 2a']},
                    {id: 'math_high_2', question: 'What is the derivative of x³?', correct_answer: '3x²', incorrect_answers: ['x³', '3x', 'x²']},
                    {id: 'math_high_3', question: 'What is sin(90°)?', correct_answer: '1', incorrect_answers: ['0', '-1', '0.5']},
                    {id: 'math_high_4', question: 'What is cos(0°)?', correct_answer: '1', incorrect_answers: ['0', '-1', '0.5']},
                    {id: 'math_high_5', question: 'What is log₁₀(100)?', correct_answer: '2', incorrect_answers: ['1', '10', '100']},
                    {id: 'math_high_6', question: 'What is the integral of x²?', correct_answer: 'x³/3 + C', incorrect_answers: ['2x + C', 'x² + C', '3x² + C']},
                    {id: 'math_high_7', question: 'What is the slope of a line through (0,0) and (3,6)?', correct_answer: '2', incorrect_answers: ['3', '1', '0.5']},
                    {id: 'math_high_8', question: 'What is 5! (5 factorial)?', correct_answer: '120', incorrect_answers: ['100', '125', '150']},
                    {id: 'math_high_9', question: 'What is the Pythagorean theorem?', correct_answer: 'a² + b² = c²', incorrect_answers: ['a + b = c', 'a² - b² = c²', 'ab = c²']},
                    {id: 'math_high_10', question: 'What is tan(45°)?', correct_answer: '1', incorrect_answers: ['0', '√2', '0.5']}
                ],
                college: [
                    {id: 'math_col_1', question: 'What is Euler’s Identity relating e, i, and π?', correct_answer: 'e^(iπ) + 1 = 0', incorrect_answers: ['e^(iπ) = 1', 'e^(π) + i = 0', 'e^(2πi) = -1']},
                    {id: 'math_col_2', question: 'What is the determinant of a 2x2 matrix [[a,b],[c,d]]?', correct_answer: 'ad - bc', incorrect_answers: ['ac - bd', 'ab - cd', 'ad + bc']},
                    {id: 'math_col_3', question: 'What is the derivative of ln(x)?', correct_answer: '1/x', incorrect_answers: ['e^x', 'x', '1/x²']},
                    {id: 'math_col_4', question: 'Which test determines convergence of an alternating series?', correct_answer: 'Leibniz Test', incorrect_answers: ['Ratio Test', 'Root Test', 'Integral Test']},
                    {id: 'math_col_5', question: 'What is the rank of an invertible n×n matrix?', correct_answer: 'n', incorrect_answers: ['0', '1', 'n - 1']},
                    {id: 'math_col_6', question: 'What is the eigenvalues of an identity matrix I?', correct_answer: 'All are 1', incorrect_answers: ['All are 0', 'Alternating ±1', 'Undefined']}
                ]
            },
            science: {
                elementary: [
                    {id: 'sci_elem_1', question: 'What do plants need to grow?', correct_answer: 'Sunlight and water', incorrect_answers: ['Only water', 'Only sunlight', 'Only soil']},
                    {id: 'sci_elem_2', question: 'How many legs does a spider have?', correct_answer: '8', incorrect_answers: ['6', '4', '10']},
                    {id: 'sci_elem_3', question: 'What is the center of our solar system?', correct_answer: 'The Sun', incorrect_answers: ['The Moon', 'Earth', 'Mars']},
                    {id: 'sci_elem_4', question: 'What do we call baby frogs?', correct_answer: 'Tadpoles', incorrect_answers: ['Puppies', 'Kittens', 'Chicks']},
                    {id: 'sci_elem_5', question: 'Which animal is known for changing colors?', correct_answer: 'Chameleon', incorrect_answers: ['Lion', 'Elephant', 'Tiger']},
                    {id: 'sci_elem_6', question: 'What do bees make?', correct_answer: 'Honey', incorrect_answers: ['Milk', 'Butter', 'Cheese']},
                    {id: 'sci_elem_7', question: 'Which part of a plant makes food?', correct_answer: 'Leaves', incorrect_answers: ['Roots', 'Stem', 'Flowers']},
                    {id: 'sci_elem_8', question: 'What do fish use to breathe underwater?', correct_answer: 'Gills', incorrect_answers: ['Lungs', 'Nose', 'Mouth']},
                    {id: 'sci_elem_9', question: 'What is the largest mammal on Earth?', correct_answer: 'Blue whale', incorrect_answers: ['Elephant', 'Giraffe', 'Lion']},
                    {id: 'sci_elem_10', question: 'Which planet is known as the red planet?', correct_answer: 'Mars', incorrect_answers: ['Jupiter', 'Venus', 'Saturn']}
                ],
                middle: [
                    {id: 'sci_mid_1', question: 'What is the chemical symbol for water?', correct_answer: 'H₂O', incorrect_answers: ['CO₂', 'O₂', 'H₂']},
                    {id: 'sci_mid_2', question: 'Which planet is closest to the Sun?', correct_answer: 'Mercury', incorrect_answers: ['Venus', 'Earth', 'Mars']},
                    {id: 'sci_mid_3', question: 'What is the process by which plants make food?', correct_answer: 'Photosynthesis', incorrect_answers: ['Respiration', 'Digestion', 'Circulation']},
                    {id: 'sci_mid_4', question: 'What gas do humans breathe in for survival?', correct_answer: 'Oxygen', incorrect_answers: ['Carbon dioxide', 'Nitrogen', 'Hydrogen']},
                    {id: 'sci_mid_5', question: 'What is the powerhouse of the cell?', correct_answer: 'Mitochondria', incorrect_answers: ['Nucleus', 'Ribosome', 'Chloroplast']},
                    {id: 'sci_mid_6', question: 'How many bones are in an adult human body?', correct_answer: '206', incorrect_answers: ['185', '220', '195']},
                    {id: 'sci_mid_7', question: 'What is the speed of light approximately?', correct_answer: '300,000 km/s', incorrect_answers: ['250,000 km/s', '350,000 km/s', '400,000 km/s']},
                    {id: 'sci_mid_8', question: 'What is the boiling point of water in Celsius?', correct_answer: '100°C', incorrect_answers: ['90°C', '110°C', '120°C']}
                ],
                high: [
                    {id: 'sci_high_1', question: 'What is the Heisenberg Uncertainty Principle?', correct_answer: 'Position and momentum cannot both be precisely measured simultaneously', incorrect_answers: ['Energy equals mass times c squared', 'Matter cannot be destroyed', 'Every action has an equal reaction']},
                    {id: 'sci_high_2', question: 'What is the first law of thermodynamics?', correct_answer: 'Energy cannot be created or destroyed', incorrect_answers: ['Entropy always increases', 'Heat flows hot to cold', 'Work equals force times distance']},
                    {id: 'sci_high_3', question: 'What is the molecular geometry of methane (CH₄)?', correct_answer: 'Tetrahedral', incorrect_answers: ['Linear', 'Trigonal planar', 'Octahedral']},
                    {id: 'sci_high_4', question: 'What is the function of ribosomes?', correct_answer: 'Protein synthesis', incorrect_answers: ['DNA replication', 'Lipid storage', 'Cell division']},
                    {id: 'sci_high_5', question: 'What is Ohm’s law?', correct_answer: 'V = IR', incorrect_answers: ['F = ma', 'E = mc²', 'P = IV']},
                    {id: 'sci_high_6', question: 'What is the Avogadro constant?', correct_answer: '6.022 × 10²³', incorrect_answers: ['3.14159', '2.718', '1.602 × 10⁻¹⁹']}
                ],
                college: [
                    {id: 'sci_col_1', question: 'What is the Schrödinger equation used for?', correct_answer: 'Describing quantum mechanical wavefunctions', incorrect_answers: ['Calculating stellar luminosity', 'Predicting tectonic drift', 'Determining fluid viscosity']},
                    {id: 'sci_col_2', question: 'Which enzyme synthesizes RNA from a DNA template?', correct_answer: 'RNA Polymerase', incorrect_answers: ['DNA Ligase', 'Topoisomerase', 'Helicase']},
                    {id: 'sci_col_3', question: 'What does Gibbs Free Energy (ΔG < 0) indicate about a reaction?', correct_answer: 'Spontaneous reaction', incorrect_answers: ['Non-spontaneous', 'At equilibrium', 'Zero entropy']},
                    {id: 'sci_col_4', question: 'Which particle mediates the electromagnetic force?', correct_answer: 'Photon', incorrect_answers: ['Gluon', 'W Boson', 'Graviton']}
                ]
            },
            history: {
                elementary: [
                    {id: 'hist_elem_1', question: 'Who was the first President of the United States?', correct_answer: 'George Washington', incorrect_answers: ['Abraham Lincoln', 'Thomas Jefferson', 'John Adams']},
                    {id: 'hist_elem_2', question: 'In which ancient country were the Great Pyramids built?', correct_answer: 'Egypt', incorrect_answers: ['Greece', 'Rome', 'China']},
                    {id: 'hist_elem_3', question: 'Which famous explorer sailed in 1492?', correct_answer: 'Christopher Columbus', incorrect_answers: ['Marco Polo', 'Vasco da Gama', 'James Cook']},
                    {id: 'hist_elem_4', question: 'What large wall was built in Asia to protect an empire?', correct_answer: 'The Great Wall of China', incorrect_answers: ['Berlin Wall', 'Hadrian\'s Wall', 'Western Wall']}
                ],
                middle: [
                    {id: 'hist_mid_1', question: 'In which year did World War II end?', correct_answer: '1945', incorrect_answers: ['1939', '1944', '1950']},
                    {id: 'hist_mid_2', question: 'Who was known as the Maid of Orléans in France?', correct_answer: 'Joan of Arc', incorrect_answers: ['Marie Antoinette', 'Queen Elizabeth', 'Cleopatra']},
                    {id: 'hist_mid_3', question: 'Which ancient civilization built the Colosseum?', correct_answer: 'Romans', incorrect_answers: ['Greeks', 'Egyptians', 'Persians']},
                    {id: 'hist_mid_4', question: 'What document was signed in 1215 limiting royal power in England?', correct_answer: 'Magna Carta', incorrect_answers: ['Bill of Rights', 'Treaty of Paris', 'Declaration of Rights']},
                    {id: 'hist_mid_5', question: 'Who delivered the "I Have a Dream" speech in 1963?', correct_answer: 'Martin Luther King Jr.', incorrect_answers: ['Malcolm X', 'Nelson Mandela', 'John F. Kennedy']}
                ],
                high: [
                    {id: 'hist_high_1', question: 'What event triggered the start of World War I in 1914?', correct_answer: 'Assassination of Archduke Franz Ferdinand', incorrect_answers: ['Invasion of Poland', 'Sinking of the Lusitania', 'Russian Revolution']},
                    {id: 'hist_high_2', question: 'Which treaty officially concluded World War I in 1919?', correct_answer: 'Treaty of Versailles', incorrect_answers: ['Treaty of Utrecht', 'Treaty of Ghent', 'Treaty of Westphalia']},
                    {id: 'hist_high_3', question: 'The French Revolution began with the storming of which fortress in 1789?', correct_answer: 'The Bastille', incorrect_answers: ['Versailles', 'Tuileries', 'Louvre']},
                    {id: 'hist_high_4', question: 'Who founded the Mongol Empire in the early 13th century?', correct_answer: 'Genghis Khan', incorrect_answers: ['Kublai Khan', 'Attila the Hun', 'Tamerlane']}
                ],
                college: [
                    {id: 'hist_col_1', question: 'The Peace of Westphalia (1648) established which fundamental concept in international law?', correct_answer: 'Westphalian State Sovereignty', incorrect_answers: ['Collective Security', 'Supranational Governance', 'Imperial Hegemony']},
                    {id: 'hist_col_2', question: 'Which Chinese dynasty is renowned for establishing the civil service exam system broadly?', correct_answer: 'Tang Dynasty', incorrect_answers: ['Qin Dynasty', 'Shang Dynasty', 'Yuan Dynasty']},
                    {id: 'hist_col_3', question: 'The Meiji Restoration of 1868 occurred in which nation?', correct_answer: 'Japan', incorrect_answers: ['China', 'Korea', 'Thailand']}
                ]
            },
            geography: {
                elementary: [
                    {id: 'geo_elem_1', question: 'How many continents are on planet Earth?', correct_answer: '7', incorrect_answers: ['5', '6', '8']},
                    {id: 'geo_elem_2', question: 'What is the largest ocean on Earth?', correct_answer: 'Pacific Ocean', incorrect_answers: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean']},
                    {id: 'geo_elem_3', question: 'What is the capital of France?', correct_answer: 'Paris', incorrect_answers: ['London', 'Berlin', 'Rome']},
                    {id: 'geo_elem_4', question: 'Which continent is known for having kangaroos?', correct_answer: 'Australia', incorrect_answers: ['Africa', 'Asia', 'South America']}
                ],
                middle: [
                    {id: 'geo_mid_1', question: 'What is the longest river in the world?', correct_answer: 'Nile River', incorrect_answers: ['Amazon River', 'Mississippi River', 'Yangtze River']},
                    {id: 'geo_mid_2', question: 'What is the highest mountain above sea level?', correct_answer: 'Mount Everest', incorrect_answers: ['K2', 'Mount Kilimanjaro', 'Mount Fuji']},
                    {id: 'geo_mid_3', question: 'What is the capital of Japan?', correct_answer: 'Tokyo', incorrect_answers: ['Kyoto', 'Osaka', 'Seoul']},
                    {id: 'geo_mid_4', question: 'Which desert is the largest hot desert in the world?', correct_answer: 'Sahara Desert', incorrect_answers: ['Gobi Desert', 'Kalahari Desert', 'Atacama Desert']},
                    {id: 'geo_mid_5', question: 'What is the capital of Canada?', correct_answer: 'Ottawa', incorrect_answers: ['Toronto', 'Vancouver', 'Montreal']}
                ],
                high: [
                    {id: 'geo_high_1', question: 'Which strait separates Europe from Africa at Gibraltar?', correct_answer: 'Strait of Gibraltar', incorrect_answers: ['Bosphorus Strait', 'Bering Strait', 'Malacca Strait']},
                    {id: 'geo_high_2', question: 'Which country has the most natural lakes in the world?', correct_answer: 'Canada', incorrect_answers: ['Russia', 'United States', 'Finland']},
                    {id: 'geo_high_3', question: 'What is the driest non-polar desert in the world?', correct_answer: 'Atacama Desert', incorrect_answers: ['Mojave Desert', 'Sahara Desert', 'Arabian Desert']},
                    {id: 'geo_high_4', question: 'Which mountain range separates Europe from Asia?', correct_answer: 'Ural Mountains', incorrect_answers: ['Alps', 'Andes', 'Rockies']}
                ],
                college: [
                    {id: 'geo_col_1', question: 'What is the Köppen climate classification for a tropical rainforest?', correct_answer: 'Af', incorrect_answers: ['Cfa', 'BWh', 'Dfb']},
                    {id: 'geo_col_2', question: 'Which landlocked country is located between China and Russia?', correct_answer: 'Mongolia', incorrect_answers: ['Kazakhstan', 'Uzbekistan', 'Nepal']},
                    {id: 'geo_col_3', question: 'What tectonic boundary formed the Mariana Trench?', correct_answer: 'Convergent Subduction Zone', incorrect_answers: ['Divergent Rift', 'Transform Fault', 'Hotspot Plume']}
                ]
            },
            technology: {
                elementary: [
                    {id: 'tech_elem_1', question: 'What does "PC" stand for in computing?', correct_answer: 'Personal Computer', incorrect_answers: ['Private Caller', 'Public Central', 'Program Code']},
                    {id: 'tech_elem_2', question: 'Which device is used to type letters into a computer?', correct_answer: 'Keyboard', incorrect_answers: ['Mouse', 'Monitor', 'Speaker']},
                    {id: 'tech_elem_3', question: 'What is the brain of a computer called?', correct_answer: 'CPU', incorrect_answers: ['Hard Drive', 'RAM', 'USB']},
                    {id: 'tech_elem_4', question: 'Which company created the iPhone?', correct_answer: 'Apple', incorrect_answers: ['Microsoft', 'Google', 'Sony']}
                ],
                middle: [
                    {id: 'tech_mid_1', question: 'What does HTML stand for?', correct_answer: 'HyperText Markup Language', incorrect_answers: ['High Tech Modern Language', 'Hyperlink Text Modular Logic', 'Home Tool Markup Level']},
                    {id: 'tech_mid_2', question: 'What does "URL" stand for?', correct_answer: 'Uniform Resource Locator', incorrect_answers: ['Universal Routing Link', 'Unified Resource List', 'User Request Link']},
                    {id: 'tech_mid_3', question: 'Which programming language is widely used for web styling?', correct_answer: 'CSS', incorrect_answers: ['SQL', 'C++', 'Java']},
                    {id: 'tech_mid_4', question: 'What is 1 Byte equal to in bits?', correct_answer: '8 bits', incorrect_answers: ['4 bits', '16 bits', '32 bits']},
                    {id: 'tech_mid_5', question: 'Who co-founded Microsoft alongside Paul Allen?', correct_answer: 'Bill Gates', incorrect_answers: ['Steve Jobs', 'Mark Zuckerberg', 'Larry Page']}
                ],
                high: [
                    {id: 'tech_high_1', question: 'What is the primary function of DNS on the internet?', correct_answer: 'Translating domain names into IP addresses', incorrect_answers: ['Encrypting passwords', 'Storing database backups', 'Rendering HTML pages']},
                    {id: 'tech_high_2', question: 'What is the time complexity of Binary Search?', correct_answer: 'O(log n)', incorrect_answers: ['O(n)', 'O(n²)', 'O(1)']},
                    {id: 'tech_high_3', question: 'Which protocol secures web communication with encryption?', correct_answer: 'HTTPS', incorrect_answers: ['FTP', 'HTTP', 'Telnet']},
                    {id: 'tech_high_4', question: 'What does SQL stand for in database management?', correct_answer: 'Structured Query Language', incorrect_answers: ['Standard Quantum Logic', 'Simple Question List', 'Sequential Query Loop']}
                ],
                college: [
                    {id: 'tech_col_1', question: 'In distributed systems, what does the CAP theorem state is impossible to achieve simultaneously?', correct_answer: 'Consistency, Availability, Partition Tolerance', incorrect_answers: ['Concurrency, Atomicity, Performance', 'Caching, Authentication, Privacy', 'Compatibility, Adaptability, Portability']},
                    {id: 'tech_col_2', question: 'What algorithm is used to find the shortest path in a weighted graph with non-negative edges?', correct_answer: 'Dijkstra’s Algorithm', incorrect_answers: ['Kruskal’s Algorithm', 'QuickSort', 'Bellman-Ford Algorithm']},
                    {id: 'tech_col_3', question: 'What is asymmetric cryptography based on?', correct_answer: 'Public and Private Key Pairs', incorrect_answers: ['Shared Secret Key', 'Hashing Only', 'One-time Pad']}
                ]
            },
            literature: {
                elementary: [
                    {id: 'lit_elem_1', question: 'Who wrote the Harry Potter series?', correct_answer: 'J.K. Rowling', incorrect_answers: ['Roald Dahl', 'Dr. Seuss', 'C.S. Lewis']},
                    {id: 'lit_elem_2', question: 'What animal character is famous in "Charlotte\'s Web"?', correct_answer: 'Wilbur the Pig', incorrect_answers: ['Peter Rabbit', 'Winnie the Pooh', 'Stuart Little']},
                    {id: 'lit_elem_3', question: 'Who wrote "Charlie and the Chocolate Factory"?', correct_answer: 'Roald Dahl', incorrect_answers: ['Hans Christian Andersen', 'Mark Twain', 'Dr. Seuss']}
                ],
                middle: [
                    {id: 'lit_mid_1', question: 'Who wrote the play "Romeo and Juliet"?', correct_answer: 'William Shakespeare', incorrect_answers: ['Charles Dickens', 'Jane Austen', 'Mark Twain']},
                    {id: 'lit_mid_2', question: 'In "The Hobbit", what is the name of the main hobbit protagonist?', correct_answer: 'Bilbo Baggins', incorrect_answers: ['Frodo Baggins', 'Samwise Gamgee', 'Gandalf']},
                    {id: 'lit_mid_3', question: 'Who wrote "The Adventures of Tom Sawyer"?', correct_answer: 'Mark Twain', incorrect_answers: ['Ernest Hemingway', 'F. Scott Fitzgerald', 'Edgar Allan Poe']},
                    {id: 'lit_mid_4', question: 'What is the detective character created by Arthur Conan Doyle?', correct_answer: 'Sherlock Holmes', incorrect_answers: ['Hercule Poirot', 'Miss Marple', 'Philip Marlowe']}
                ],
                high: [
                    {id: 'lit_high_1', question: 'Who wrote the dystopian novel "1984"?', correct_answer: 'George Orwell', incorrect_answers: ['Aldous Huxley', 'Ray Bradbury', 'H.G. Wells']},
                    {id: 'lit_high_2', question: 'Which novel begins with "Call me Ishmael"?', correct_answer: 'Moby-Dick', incorrect_answers: ['The Great Gatsby', 'Great Expectations', 'Heart of Darkness']},
                    {id: 'lit_high_3', question: 'Who wrote the epic poem "The Odyssey"?', correct_answer: 'Homer', incorrect_answers: ['Virgil', 'Dante Alighieri', 'Ovid']},
                    {id: 'lit_high_4', question: 'Who wrote "Pride and Prejudice"?', correct_answer: 'Jane Austen', incorrect_answers: ['Charlotte Brontë', 'Emily Dickinson', 'Virginia Woolf']}
                ],
                college: [
                    {id: 'lit_col_1', question: 'Which modernist novel by James Joyce takes place entirely on June 16, 1904?', correct_answer: 'Ulysses', incorrect_answers: ['Finnegans Wake', 'To the Lighthouse', 'The Waste Land']},
                    {id: 'lit_col_2', question: 'What literary device is characterized by an unexpected outcome contradicting expectation?', correct_answer: 'Irony', incorrect_answers: ['Metonymy', 'Synecdoche', 'Allegory']},
                    {id: 'lit_col_3', question: 'Who authored the French epic "In Search of Lost Time" (À la recherche du temps perdu)?', correct_answer: 'Marcel Proust', incorrect_answers: ['Victor Hugo', 'Gustave Flaubert', 'Albert Camus']}
                ]
            },
            art: {
                elementary: [
                    {id: 'art_elem_1', question: 'Which are the three primary colors of pigment?', correct_answer: 'Red, Yellow, Blue', incorrect_answers: ['Green, Orange, Purple', 'Black, White, Gray', 'Red, Green, Blue']},
                    {id: 'art_elem_2', question: 'Who painted the famous Mona Lisa?', correct_answer: 'Leonardo da Vinci', incorrect_answers: ['Vincent van Gogh', 'Pablo Picasso', 'Claude Monet']},
                    {id: 'art_elem_3', question: 'What color do you get when you mix blue and yellow?', correct_answer: 'Green', incorrect_answers: ['Orange', 'Purple', 'Brown']}
                ],
                middle: [
                    {id: 'art_mid_1', question: 'Who painted "The Starry Night"?', correct_answer: 'Vincent van Gogh', incorrect_answers: ['Pablo Picasso', 'Salvador Dalí', 'Michelangelo']},
                    {id: 'art_mid_2', question: 'Which artistic movement is Pablo Picasso famous for co-founding?', correct_answer: 'Cubism', incorrect_answers: ['Impressionism', 'Surrealism', 'Pop Art']},
                    {id: 'art_mid_3', question: 'Who painted the ceiling of the Sistine Chapel?', correct_answer: 'Michelangelo', incorrect_answers: ['Raphael', 'Donatello', 'Leonardo da Vinci']}
                ],
                high: [
                    {id: 'art_high_1', question: 'Which Spanish artist painted the surrealist masterpiece "The Persistence of Memory" (melting clocks)?', correct_answer: 'Salvador Dalí', incorrect_answers: ['Joan Miró', 'Francisco Goya', 'Diego Velázquez']},
                    {id: 'art_high_2', question: 'What painting technique uses tiny dots of color that blend in the viewer’s eye?', correct_answer: 'Pointillism', incorrect_answers: ['Chiaroscuro', 'Fresco', 'Impasto']},
                    {id: 'art_high_3', question: 'Which artist is famed for Campbell\'s Soup Cans Pop Art?', correct_answer: 'Andy Warhol', incorrect_answers: ['Roy Lichtenstein', 'Keith Haring', 'Jackson Pollock']}
                ],
                college: [
                    {id: 'art_col_1', question: 'What Italian Renaissance term describes strong contrast between light and dark?', correct_answer: 'Chiaroscuro', incorrect_answers: ['Sfumato', 'Trompe-l\'œil', 'Pentimento']},
                    {id: 'art_col_2', question: 'Which Bauhaus architect formulated the motto "Less is more"?', correct_answer: 'Ludwig Mies van der Rohe', incorrect_answers: ['Walter Gropius', 'Le Corbusier', 'Frank Lloyd Wright']}
                ]
            },
            sports: {
                elementary: [
                    {id: 'sport_elem_1', question: 'How many players are on a standard soccer team on the field?', correct_answer: '11', incorrect_answers: ['9', '10', '12']},
                    {id: 'sport_elem_2', question: 'In basketball, how many points is a regular free throw worth?', correct_answer: '1 point', incorrect_answers: ['2 points', '3 points', '0 points']},
                    {id: 'sport_elem_3', question: 'Which sport uses a racket and a yellow ball?', correct_answer: 'Tennis', incorrect_answers: ['Golf', 'Bowling', 'Baseball']}
                ],
                middle: [
                    {id: 'sport_mid_1', question: 'How many rings are in the Olympic flag symbol?', correct_answer: '5', incorrect_answers: ['4', '6', '7']},
                    {id: 'sport_mid_2', question: 'Which country won the first FIFA World Cup in 1930?', correct_answer: 'Uruguay', incorrect_answers: ['Brazil', 'Argentina', 'Italy']},
                    {id: 'sport_mid_3', question: 'In bowling, what is the term for knocking down all 10 pins on the first roll?', correct_answer: 'Strike', incorrect_answers: ['Spare', 'Split', 'Turkey']},
                    {id: 'sport_mid_4', question: 'What is the distance of a standard marathon race?', correct_answer: '42.195 km (26.2 miles)', incorrect_answers: ['30 km', '50 km', '21 km']}
                ],
                high: [
                    {id: 'sport_high_1', question: 'Which tennis tournament is played on grass courts?', correct_answer: 'Wimbledon', incorrect_answers: ['US Open', 'French Open', 'Australian Open']},
                    {id: 'sport_high_2', question: 'In cricket, how many wickets make up a bowler\'s hat-trick?', correct_answer: '3 consecutive wickets', incorrect_answers: ['2 wickets', '4 wickets', '5 wickets']},
                    {id: 'sport_high_3', question: 'Who holds the world record for the 100-meter sprint at 9.58 seconds?', correct_answer: 'Usain Bolt', incorrect_answers: ['Tyson Gay', 'Yohan Blake', 'Carl Lewis']}
                ],
                college: [
                    {id: 'sport_col_1', question: 'In what year were the first modern Olympic Games held in Athens?', correct_answer: '1896', incorrect_answers: ['1900', '1888', '1904']},
                    {id: 'sport_col_2', question: 'In Formula 1, which flag signifies hazardous debris or caution on track?', correct_answer: 'Yellow flag', incorrect_answers: ['Red flag', 'Blue flag', 'Black flag']}
                ]
            },
            general: {
                elementary: [
                    {id: 'gen_elem_1', question: 'How many days are in a leap year?', correct_answer: '366', incorrect_answers: ['365', '364', '360']},
                    {id: 'gen_elem_2', question: 'What color are emeralds?', correct_answer: 'Green', incorrect_answers: ['Red', 'Blue', 'Yellow']},
                    {id: 'gen_elem_3', question: 'How many hours are in one full day?', correct_answer: '24', incorrect_answers: ['12', '48', '60']},
                    {id: 'gen_elem_4', question: 'Which animal is known as "Man\'s best friend"?', correct_answer: 'Dog', incorrect_answers: ['Cat', 'Horse', 'Parrot']}
                ],
                middle: [
                    {id: 'gen_mid_1', question: 'What is the smallest country in the world by area?', correct_answer: 'Vatican City', incorrect_answers: ['Monaco', 'San Marino', 'Liechtenstein']},
                    {id: 'gen_mid_2', question: 'What is the currency of Japan?', correct_answer: 'Yen', incorrect_answers: ['Won', 'Yuan', 'Rupee']},
                    {id: 'gen_mid_3', question: 'How many strings does a standard acoustic guitar have?', correct_answer: '6', incorrect_answers: ['4', '5', '7']},
                    {id: 'gen_mid_4', question: 'Which blood type is known as the universal red blood cell donor?', correct_answer: 'O negative', incorrect_answers: ['A positive', 'B positive', 'AB positive']},
                    {id: 'gen_mid_5', question: 'Which instrument is used to measure earthquakes?', correct_answer: 'Seismograph', incorrect_answers: ['Barometer', 'Thermometer', 'Anemometer']}
                ],
                high: [
                    {id: 'gen_high_1', question: 'Which country gifted the Statue of Liberty to the United States?', correct_answer: 'France', incorrect_answers: ['United Kingdom', 'Spain', 'Italy']},
                    {id: 'gen_high_2', question: 'What is the chemical symbol for Gold?', correct_answer: 'Au', incorrect_answers: ['Ag', 'Gd', 'Go']},
                    {id: 'gen_high_3', question: 'Which gas makes up approximately 78% of Earth\'s atmosphere?', correct_answer: 'Nitrogen', incorrect_answers: ['Oxygen', 'Carbon Dioxide', 'Argon']},
                    {id: 'gen_high_4', question: 'How many sides does a regular heptagon have?', correct_answer: '7', incorrect_answers: ['6', '8', '9']}
                ],
                college: [
                    {id: 'gen_col_1', question: 'Who is the author of "The Wealth of Nations" (1776)?', correct_answer: 'Adam Smith', incorrect_answers: ['John Maynard Keynes', 'Karl Marx', 'David Ricardo']},
                    {id: 'gen_col_2', question: 'In the International System of Units (SI), what is the unit of electrical resistance?', correct_answer: 'Ohm', incorrect_answers: ['Watt', 'Volt', 'Ampere']},
                    {id: 'gen_col_3', question: 'Which treaty established the European Union in 1993?', correct_answer: 'Maastricht Treaty', incorrect_answers: ['Treaty of Rome', 'Treaty of Lisbon', 'Schengen Agreement']}
                ]
            }
        };
        
        this.encouragementMessages = {
            correct: [
                "🎉 Awesome! You got it right!",
                "✨ Fantastic work! Keep it up!",
                "🌟 Brilliant! You're doing great!",
                "🎯 Perfect! You nailed it!",
                "🏆 Excellent! You're on fire!",
                "⭐ Outstanding! Well done!",
                "🚀 Amazing! You're a star!",
                "💫 Superb! Keep going!"
            ],
            incorrect: [
                "💪 Don't worry! You're learning and that's what matters!",
                "🌱 Every mistake helps you grow! Keep trying!",
                "🎯 Close one! You're getting better with each question!",
                "💡 Great effort! Learning is a journey, not a destination!",
                "🌈 No worries! Every expert was once a beginner!",
                "🔥 Keep going! You're building your knowledge!",
                "⚡ That's okay! Practice makes perfect!",
                "🌟 Stay positive! You're making progress!"
            ]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.updateSoundIcon();
        this.showPage('registration-page');
    }

    setupEventListeners() {
        // Registration Form & Buttons
        const regForm = document.getElementById('registration-form');
        if (regForm) {
            regForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerUser();
            });
        }
        document.getElementById('register-btn').addEventListener('click', () => this.registerUser());
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('retake-quiz-btn').addEventListener('click', () => this.retakeQuiz());
        document.getElementById('share-results-btn').addEventListener('click', () => this.shareResults());
        document.getElementById('change-settings-btn').addEventListener('click', () => this.changeSettings());

        // Sound Toggle
        document.getElementById('sound-toggle-btn').addEventListener('click', () => this.toggleSound());

        // Review Answers Accordion
        const toggleReviewBtn = document.getElementById('toggle-review-btn');
        if (toggleReviewBtn) {
            toggleReviewBtn.addEventListener('click', () => this.toggleReviewSection());
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Do not capture if typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }

            const activePage = document.querySelector('.page.active');
            if (!activePage) return;

            // Global sound toggle key 'M' or 'm'
            if (e.key === 'm' || e.key === 'M') {
                this.toggleSound();
                return;
            }

            // Quiz page shortcuts
            if (activePage.id === 'quiz-page') {
                if (!this.isAnswered) {
                    const answerBtns = document.querySelectorAll('.answer-btn');
                    if (e.key >= '1' && e.key <= '4') {
                        const idx = parseInt(e.key) - 1;
                        if (answerBtns[idx]) answerBtns[idx].click();
                    } else if (e.key.toLowerCase() === 'a' && answerBtns[0]) {
                        answerBtns[0].click();
                    } else if (e.key.toLowerCase() === 'b' && answerBtns[1]) {
                        answerBtns[1].click();
                    } else if (e.key.toLowerCase() === 'c' && answerBtns[2]) {
                        answerBtns[2].click();
                    } else if (e.key.toLowerCase() === 'd' && answerBtns[3]) {
                        answerBtns[3].click();
                    } else if ((e.key === 's' || e.key === 'S') && !document.getElementById('skip-btn').disabled) {
                        this.skipQuestion();
                    }
                } else {
                    // Next question on Enter or Space
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.nextQuestion();
                    }
                }
            }
        });
    }

    toggleSound() {
        const isMuted = this.sound.toggleMute();
        this.updateSoundIcon();
        this.showToast(isMuted ? 'Sound muted 🔇' : 'Sound unmuted 🔊');
    }

    updateSoundIcon() {
        const icon = document.getElementById('sound-icon');
        if (!icon) return;
        if (this.sound.isMuted) {
            icon.className = 'fas fa-volume-mute';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        if (!toast) return;

        toastMsg.textContent = message;
        toastIcon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
        
        toast.style.display = 'flex';
        toast.classList.add('visible');

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => { toast.style.display = 'none'; }, 300);
        }, 2200);
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    registerUser() {
        this.sound.playClick();
        const name = document.getElementById('userName').value.trim();
        const age = parseInt(document.getElementById('userAge').value);
        const qualification = document.getElementById('userQualification').value;
        const favoriteSubject = document.getElementById('favoriteSubject').value;

        if (!name) {
            this.showToast('Please enter your full name! 😊', 'error');
            document.getElementById('userName').focus();
            return;
        }
        if (!age || age < 5 || age > 100) {
            this.showToast('Please enter a valid age (5-100)! 📅', 'error');
            document.getElementById('userAge').focus();
            return;
        }
        if (!qualification) {
            this.showToast('Please select your education level! 📚', 'error');
            document.getElementById('userQualification').focus();
            return;
        }
        if (!favoriteSubject) {
            this.showToast('Please select your favorite subject! ❤️', 'error');
            document.getElementById('favoriteSubject').focus();
            return;
        }

        this.userData = { name, age, qualification, favoriteSubject };

        document.getElementById('user-name-display').textContent = name;
        document.getElementById('user-age-display').textContent = age;
        document.getElementById('user-level-display').textContent = this.getQualificationName(qualification);
        document.getElementById('user-subject-display').textContent = this.getSubjectName(favoriteSubject);

        this.setupQuizSettings();
        this.showPage('settings-page');
    }

    getQualificationName(qual) {
        const names = {
            elementary: 'Elementary School',
            middle: 'Middle School',
            high: 'High School',
            college: 'College / University',
            graduate: 'Graduate Degree',
            professional: 'Working Professional',
            teacher: 'Teacher / Educator'
        };
        return names[qual] || qual;
    }

    getSubjectName(subject) {
        const names = {
            mathematics: '🔢 Mathematics',
            science: '🔬 Science',
            history: '📜 History',
            geography: '🌍 Geography',
            literature: '📚 Literature',
            art: '🎨 Art & Culture',
            sports: '⚽ Sports',
            technology: '💻 Technology',
            general: '🌟 General Knowledge'
        };
        return names[subject] || subject;
    }

    setupQuizSettings() {
        const categorySelect = document.getElementById('category');
        categorySelect.value = this.userData.favoriteSubject || 'general';
        
        const difficultySelect = document.getElementById('difficulty');
        if (this.userData.qualification === 'elementary') {
            difficultySelect.value = 'easy';
        } else if (this.userData.qualification === 'middle') {
            difficultySelect.value = 'medium';
        } else {
            difficultySelect.value = 'hard';
        }
        
        const timerSelect = document.getElementById('timerDuration');
        if (this.userData.qualification === 'elementary') {
            timerSelect.value = '90';
        } else {
            timerSelect.value = '60';
        }
    }

    startQuiz() {
        this.sound.playClick();
        this.collectQuizSettings();
        this.showPage('loading-page');
        this.updateLoadingMessage();
        
        setTimeout(() => {
            this.questions = this.getFreshQuestions();
            this.initializeQuiz();
            this.showPage('quiz-page');
            this.displayCurrentQuestion();
            this.startTimer();
        }, 1800);
    }

    collectQuizSettings() {
        this.quizData.category = document.getElementById('category').value;
        this.quizData.difficulty = document.getElementById('difficulty').value;
        this.quizData.questionCount = parseInt(document.getElementById('questionCount').value);
        this.quizData.timerDuration = parseInt(document.getElementById('timerDuration').value);
    }

    mapLevelToTier(qual) {
        if (qual === 'elementary') return 'elementary';
        if (qual === 'middle') return 'middle';
        if (qual === 'high') return 'high';
        // college, graduate, professional, teacher
        return 'college';
    }

    getFreshQuestions() {
        let availableQuestions = [];
        
        const subject = this.quizData.category;
        const targetTier = this.mapLevelToTier(this.userData.qualification);
        
        const subjectBank = this.questionBanks[subject] || this.questionBanks.general;

        // Priority 1: Exact target tier
        if (subjectBank[targetTier] && subjectBank[targetTier].length > 0) {
            availableQuestions.push(...subjectBank[targetTier]);
        }

        // Priority 2: Closest adjacent tiers if more questions needed
        if (availableQuestions.length < this.quizData.questionCount) {
            const tiers = ['college', 'high', 'middle', 'elementary'];
            tiers.forEach(tier => {
                if (tier !== targetTier && subjectBank[tier]) {
                    availableQuestions.push(...subjectBank[tier]);
                }
            });
        }
        
        // Priority 3: General bank if still not enough
        if (availableQuestions.length < this.quizData.questionCount && subject !== 'general') {
            const genBank = this.questionBanks.general;
            if (genBank[targetTier]) availableQuestions.push(...genBank[targetTier]);
            if (genBank.high) availableQuestions.push(...genBank.high);
            if (genBank.middle) availableQuestions.push(...genBank.middle);
        }
        
        // Filter out recently used questions for freshness
        let unusedQuestions = availableQuestions.filter(q => !this.usedQuestionIds.has(q.id));
        
        if (unusedQuestions.length < this.quizData.questionCount) {
            this.usedQuestionIds.clear();
            unusedQuestions = availableQuestions;
        }
        
        // Fisher-Yates shuffle
        const shuffled = shuffleArray(unusedQuestions);
        const selected = shuffled.slice(0, this.quizData.questionCount);
        
        // Track used IDs
        selected.forEach(q => this.usedQuestionIds.add(q.id));
        
        return selected;
    }

    updateLoadingMessage() {
        if (this.loadingInterval) clearInterval(this.loadingInterval);

        const messages = [
            "Finding fresh questions perfect for you! 🎯",
            "Customizing challenge level... ⚡",
            "Preparing personalized content... 🔧",
            "Almost ready! Let's start learning! 🚀"
        ];

        let index = 0;
        const messageElement = document.getElementById('loading-message');
        if (messageElement) messageElement.textContent = messages[0];
        
        this.loadingInterval = setInterval(() => {
            index++;
            if (index < messages.length && messageElement) {
                messageElement.textContent = messages[index];
            } else {
                clearInterval(this.loadingInterval);
                this.loadingInterval = null;
            }
        }, 450);
    }

    initializeQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.quizStartTime = Date.now();
        this.isAnswered = false;
        
        document.getElementById('total-questions').textContent = this.questions.length;
        document.getElementById('current-score').textContent = '0';
        this.updateProgressFill();
    }

    updateProgressFill() {
        const fill = document.getElementById('question-progress-fill');
        if (fill && this.questions.length > 0) {
            const pct = Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100);
            fill.style.width = `${pct}%`;
        }
    }

    displayCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.finishQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('question-text').textContent = question.question;
        this.updateProgressFill();
        
        // Shuffle answer options uniformly
        const allAnswers = [question.correct_answer, ...question.incorrect_answers];
        const shuffledAnswers = shuffleArray(allAnswers);
        
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';
        
        const keyLabels = ['1', '2', '3', '4'];

        shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            
            const badge = document.createElement('span');
            badge.className = 'answer-key-badge';
            badge.textContent = keyLabels[index] || (index + 1);

            const textSpan = document.createElement('span');
            textSpan.className = 'answer-text';
            textSpan.textContent = answer;

            button.appendChild(badge);
            button.appendChild(textSpan);
            
            button.addEventListener('click', () => this.selectAnswer(answer, button));
            answersContainer.appendChild(button);
        });

        this.isAnswered = false;
        this.questionStartTime = Date.now();
        
        // Hide feedback container & next button
        document.getElementById('feedback-container').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        
        // Reset and show Skip button
        const skipBtn = document.getElementById('skip-btn');
        skipBtn.style.display = 'inline-flex';
        skipBtn.disabled = true;

        // Dynamic skip duration (max 15s or 1/3 of total duration)
        this.skipTimeRemaining = Math.min(15, Math.max(5, Math.floor(this.quizData.timerDuration / 3)));
        document.getElementById('skip-text').textContent = `Skip (${this.skipTimeRemaining}s)`;
        
        this.startSkipTimer();
    }

    startSkipTimer() {
        if (this.skipTimer) clearInterval(this.skipTimer);
        
        this.skipTimer = setInterval(() => {
            this.skipTimeRemaining--;
            const skipText = document.getElementById('skip-text');
            const skipBtn = document.getElementById('skip-btn');
            
            if (skipText) {
                skipText.textContent = `Skip (${this.skipTimeRemaining}s)`;
            }
            
            if (this.skipTimeRemaining <= 0) {
                if (skipBtn) skipBtn.disabled = false;
                if (skipText) skipText.textContent = 'Skip Question';
                clearInterval(this.skipTimer);
                this.skipTimer = null;
            }
        }, 1000);
    }

    selectAnswer(selectedAnswer, buttonElement) {
        if (this.isAnswered) return;
        
        this.isAnswered = true;
        this.clearAllTimers();
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct_answer;
        const timeSpent = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
        
        this.userAnswers.push({
            questionNumber: this.currentQuestionIndex + 1,
            question: question.question,
            selectedAnswer,
            correctAnswer: question.correct_answer,
            isCorrect,
            status: isCorrect ? 'correct' : 'incorrect',
            timeSpent
        });
        
        if (isCorrect) {
            this.score++;
            document.getElementById('current-score').textContent = this.score;
            this.sound.playCorrect();
        } else {
            this.sound.playIncorrect();
        }
        
        // Visual feedback on answer buttons
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            const text = btn.querySelector('.answer-text') ? btn.querySelector('.answer-text').textContent : btn.textContent;
            if (text === question.correct_answer) {
                btn.classList.add('correct');
            } else if (btn === buttonElement && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        this.showFeedback(isCorrect);
        
        // Show Next button and hide Skip button
        document.getElementById('next-btn').style.display = 'inline-flex';
        document.getElementById('skip-btn').style.display = 'none';
        
        // Auto-advance after 2.5s if not manually clicked
        this.questionTimeout = setTimeout(() => {
            if (this.isAnswered) this.nextQuestion();
        }, 2500);
    }

    showFeedback(isCorrect) {
        const feedbackContainer = document.getElementById('feedback-container');
        const feedbackIcon = feedbackContainer.querySelector('.feedback-icon');
        const feedbackText = feedbackContainer.querySelector('.feedback-text');
        
        feedbackContainer.classList.remove('correct', 'incorrect');
        
        if (isCorrect) {
            feedbackContainer.classList.add('correct');
            feedbackIcon.textContent = '🎉';
            const messages = this.encouragementMessages.correct;
            feedbackText.textContent = messages[Math.floor(Math.random() * messages.length)];
        } else {
            feedbackContainer.classList.add('incorrect');
            feedbackIcon.textContent = '💪';
            const messages = this.encouragementMessages.incorrect;
            feedbackText.textContent = messages[Math.floor(Math.random() * messages.length)];
        }
        
        feedbackContainer.style.display = 'block';
    }

    skipQuestion() {
        if (this.isAnswered) return;
        
        this.isAnswered = true;
        this.clearAllTimers();
        this.sound.playIncorrect();
        
        const question = this.questions[this.currentQuestionIndex];
        const timeSpent = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
        
        this.userAnswers.push({
            questionNumber: this.currentQuestionIndex + 1,
            question: question.question,
            selectedAnswer: 'Skipped',
            correctAnswer: question.correct_answer,
            isCorrect: false,
            status: 'skipped',
            timeSpent
        });
        
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            const text = btn.querySelector('.answer-text') ? btn.querySelector('.answer-text').textContent : btn.textContent;
            if (text === question.correct_answer) {
                btn.classList.add('correct');
            }
        });
        
        this.showFeedback(false);

        document.getElementById('next-btn').style.display = 'inline-flex';
        document.getElementById('skip-btn').style.display = 'none';
        
        this.questionTimeout = setTimeout(() => {
            if (this.isAnswered) this.nextQuestion();
        }, 2000);
    }

    nextQuestion() {
        this.sound.playClick();
        this.clearAllTimers();
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayCurrentQuestion();
            this.startTimer();
        } else {
            this.finishQuiz();
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timeRemaining = this.quizData.timerDuration;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
                this.sound.playTick();
            }
            
            if (this.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        const timerValue = document.getElementById('timer-value');
        if (timerValue) timerValue.textContent = this.timeRemaining;
        
        if (timerElement) {
            timerElement.className = 'timer';
            if (this.timeRemaining <= 10) {
                timerElement.classList.add('danger');
            } else if (this.timeRemaining <= 20) {
                timerElement.classList.add('warning');
            }
        }
    }

    handleTimeUp() {
        if (this.isAnswered) return;
        this.clearAllTimers();
        this.showToast('⏰ Time’s up for this question!', 'info');
        this.skipQuestion();
    }

    clearAllTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.skipTimer) {
            clearInterval(this.skipTimer);
            this.skipTimer = null;
        }
        if (this.questionTimeout) {
            clearTimeout(this.questionTimeout);
            this.questionTimeout = null;
        }
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }

    finishQuiz() {
        this.clearAllTimers();
        this.totalQuizTime = Math.max(1, Math.round((Date.now() - this.quizStartTime) / 1000));
        this.calculateResults();
        this.populateReviewSection();
        this.showPage('results-page');
        this.sound.playVictory();
    }

    calculateResults() {
        const total = this.questions.length;
        const percentage = total > 0 ? Math.round((this.score / total) * 100) : 0;
        const avgTime = total > 0 ? (this.totalQuizTime / total).toFixed(1) : 0;
        
        document.getElementById('final-score').textContent = percentage;
        document.getElementById('correct-answers').textContent = this.score;
        document.getElementById('total-questions-result').textContent = total;
        document.getElementById('time-taken').textContent = this.totalQuizTime;
        
        const avgTimeEl = document.getElementById('avg-time');
        if (avgTimeEl) avgTimeEl.textContent = avgTime;

        document.getElementById('user-level-result').textContent = this.getQualificationName(this.userData.qualification);
        document.getElementById('user-subject-result').textContent = this.getSubjectName(this.userData.favoriteSubject);
        
        let performanceText = '';
        let performanceMessage = '';
        let achievementIcon = '';
        
        if (percentage >= 90) {
            performanceText = 'Mastery Achieved! 🌟';
            performanceMessage = `Outstanding work, ${this.userData.name}! You scored in the top tier!`;
            achievementIcon = '🏆';
        } else if (percentage >= 75) {
            performanceText = 'Great Job! 🎉';
            performanceMessage = `Well done, ${this.userData.name}! You have a strong grasp on this subject!`;
            achievementIcon = '🥇';
        } else if (percentage >= 60) {
            performanceText = 'Good Effort! 👍';
            performanceMessage = `Nice work, ${this.userData.name}! A little more practice and you will master it!`;
            achievementIcon = '🥈';
        } else {
            performanceText = 'Keep Learning! 💪';
            performanceMessage = `Don't give up, ${this.userData.name}! Every challenge is a stepping stone to knowledge!`;
            achievementIcon = '🥉';
        }
        
        const personalMessage = `Age ${this.userData.age} and building real mastery in ${this.getSubjectName(this.userData.favoriteSubject).replace(/^[^\s]+\s/, '')}! Keep up the curiosity! 🚀`;
        
        document.getElementById('achievement-icon').textContent = achievementIcon;
        document.getElementById('results-title').textContent = `${this.userData.name}, Here Are Your Results!`;
        document.getElementById('performance-text').textContent = performanceText;
        document.getElementById('performance-message').textContent = performanceMessage;
        document.getElementById('personal-message').textContent = personalMessage;
    }

    populateReviewSection() {
        const reviewContainer = document.getElementById('review-container');
        if (!reviewContainer) return;

        reviewContainer.innerHTML = '';
        
        this.userAnswers.forEach((ans, idx) => {
            const card = document.createElement('div');
            card.className = `review-card review-${ans.status}`;

            const header = document.createElement('div');
            header.className = 'review-card-header';

            const title = document.createElement('span');
            title.className = 'review-card-title';
            title.textContent = `Q${idx + 1}. ${ans.question}`;

            const badge = document.createElement('span');
            badge.className = `review-badge badge-${ans.status}`;
            if (ans.status === 'correct') {
                badge.innerHTML = '<i class="fas fa-check-circle"></i> Correct';
            } else if (ans.status === 'incorrect') {
                badge.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect';
            } else {
                badge.innerHTML = '<i class="fas fa-forward"></i> Skipped';
            }

            header.appendChild(title);
            header.appendChild(badge);

            const details = document.createElement('div');
            details.className = 'review-card-details';
            details.innerHTML = `
                <div class="review-row">
                    <strong>Your Answer:</strong> <span class="ans-selected ans-${ans.status}">${ans.selectedAnswer}</span>
                </div>
                ${!ans.isCorrect ? `
                <div class="review-row">
                    <strong>Correct Answer:</strong> <span class="ans-correct">${ans.correctAnswer}</span>
                </div>` : ''}
                <div class="review-row review-time">
                    <i class="fas fa-stopwatch"></i> ${ans.timeSpent}s
                </div>
            `;

            card.appendChild(header);
            card.appendChild(details);
            reviewContainer.appendChild(card);
        });
    }

    toggleReviewSection() {
        this.sound.playClick();
        const reviewContainer = document.getElementById('review-container');
        const arrow = document.getElementById('review-arrow-icon');
        const text = document.getElementById('toggle-review-text');
        
        if (!reviewContainer) return;

        if (reviewContainer.style.display === 'none' || !reviewContainer.style.display) {
            reviewContainer.style.display = 'flex';
            if (arrow) arrow.className = 'fas fa-chevron-up';
            if (text) text.textContent = 'Hide Answers Review';
        } else {
            reviewContainer.style.display = 'none';
            if (arrow) arrow.className = 'fas fa-chevron-down';
            if (text) text.textContent = 'Review Answers';
        }
    }

    retakeQuiz() {
        this.sound.playClick();
        this.clearAllTimers();
        this.resetQuiz();
        this.startQuiz();
    }

    resetQuiz() {
        this.clearAllTimers();
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.isAnswered = false;
        
        const reviewContainer = document.getElementById('review-container');
        if (reviewContainer) reviewContainer.style.display = 'none';
        const arrow = document.getElementById('review-arrow-icon');
        if (arrow) arrow.className = 'fas fa-chevron-down';
        const text = document.getElementById('toggle-review-text');
        if (text) text.textContent = 'Review Answers';
    }

    changeSettings() {
        this.sound.playClick();
        this.clearAllTimers();
        this.resetQuiz();
        this.showPage('settings-page');
    }

    shareResults() {
        this.sound.playClick();
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const subject = this.getSubjectName(this.userData.favoriteSubject).replace(/^[^\s]+\s/, '');
        const shareText = `🎯 ${this.userData.name} just scored ${percentage}% on QuizMaster!\n\n📚 Subject: ${subject}\n🏆 Score: ${this.score}/${this.questions.length} in ${this.totalQuizTime}s\n\nTest your knowledge at QuizMaster! 🚀`;
        
        if (navigator.share) {
            navigator.share({
                title: 'QuizMaster Results - ' + this.userData.name,
                text: shareText,
                url: window.location.href
            }).catch(() => {
                this.copyShareFallback(shareText);
            });
        } else {
            this.copyShareFallback(shareText);
        }
    }

    copyShareFallback(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('📋 Results copied to clipboard!');
            }).catch(() => {
                this.showToast('Could not copy directly. Share text ready!');
                alert(text);
            });
        } else {
            this.showToast('Results ready to share!');
            alert(text);
        }
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});
