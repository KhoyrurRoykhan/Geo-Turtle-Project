import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Accordion, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { BsArrowClockwise, BsCheckCircle } from 'react-icons/bs';
import { FaBars } from "react-icons/fa";
import { closeBrackets } from '@codemirror/autocomplete';

const correctCommands = {
  '1a': 'left(90)',
  '1b': 'right(180)'
};

const correctCommandsFB = {
  '1a': 'forward(100)',
  '1b': 'right(90)',
  '1c': 'backward(100)'
};

const Tutorial = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState('leftright');

  // Refs untuk timeout animasi
  const timeoutLeftRef = useRef(null);
  const timeoutRightRef = useRef(null);
  const timeoutFBLeftRef = useRef(null);
  const timeoutFBRightRef = useRef(null);
  // Flag untuk menghentikan animasi
  const stopLeftRef = useRef(false);
  const stopRightRef = useRef(false);
  const stopFBLeftRef = useRef(false);
  const stopFBRightRef = useRef(false);

  // ==================== STATE LEFT & RIGHT ====================
  const [pythonCode, setPythonCode] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [output, setOutput] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeKey, setActiveKey] = useState('1a');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedAnswer2, setSelectedAnswer2] = useState('');
  const [feedback, setFeedback] = useState({ question1: '', question2: '' });
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // ==================== STATE FORWARD & BACKWARD ====================
  const [pythonCodeFB, setPythonCodeFB] = useState('');
  const [commandHistoryFB, setCommandHistoryFB] = useState([]);
  const [outputFB, setOutputFB] = useState('');
  const [completedStepsFB, setCompletedStepsFB] = useState([]);
  const [activeKeyFB, setActiveKeyFB] = useState('1a');
  const [selectedAnswerFB, setSelectedAnswerFB] = useState('');
  const [selectedAnswer2FB, setSelectedAnswer2FB] = useState('');
  const [feedbackFB, setFeedbackFB] = useState({ question1: '', question2: '' });
  const [currentQuestionFB, setCurrentQuestionFB] = useState(1);

  // ==================== SKULPT FUNCTIONS ====================
  const outf = (text) => {
    setOutput(prev => prev + text);
  };

  const outfFB = (text) => {
    setOutputFB(prev => prev + text);
  };

  const builtinRead = (x) => {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
      throw `File not found: '${x}'`;
    }
    return window.Sk.builtinFiles['files'][x];
  };

  const parseSimpleCommands = (code) => {
    if (!code) return '';
    const lines = code.split('\n');
    const parsedLines = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      const leadingSpaces = line.match(/^\s*/)?.[0] || '';

      if (trimmed === '' || trimmed.startsWith('#')) {
        parsedLines.push(line);
        i++;
        continue;
      }

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);
      const isAllArgsNumeric = args.every(arg => !isNaN(parseFloat(arg)));
      const noArgCommands = ['clear', 'home', 'reset', 'penup', 'pendown', 'showturtle', 'hideturtle', 'begin_fill', 'end_fill'];

      if (trimmed.includes('(') && trimmed.includes(')')) {
        parsedLines.push(line);
      } else if (noArgCommands.includes(cmd) && args.length === 0) {
        parsedLines.push(`${leadingSpaces}${cmd}()`);
      } else if ((isAllArgsNumeric && args.length > 0) || args.length === 1) {
        parsedLines.push(`${leadingSpaces}${cmd}(${args.join(',')})`);
      } else {
        parsedLines.push(line);
      }

      i++;
    }

    return parsedLines.join('\n');
  };

  // ==================== LEFT & RIGHT FUNCTIONS ====================
  const runit = (code, forceReset = false) => {
    setOutput('');

    const parsedNewCode = parseSimpleCommands(code || pythonCode);
    const parsedHistory = commandHistory.map(cmd => parseSimpleCommands(cmd)).join('\n');

    const imports = "from turtle import *\nshape('turtle')\n";
    let prog = "";

    if (forceReset) {
      prog = imports + "reset()\nspeed(1)\n" + parsedNewCode;
    } else {
      prog = imports +
        "reset()\nspeed(0)\n" + parsedHistory +
        "\nspeed(1)\n" + parsedNewCode;
    }

    try {
      window.Sk.pre = "output";
      window.Sk.configure({ output: outf, read: builtinRead });
      (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas';

      window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
      ).then(
        () => console.log('success'),
        (err) => setOutput(prev => prev + err.toString())
      );
    } catch (err) {
      setOutput(prev => prev + err.toString());
    }
  };

  // ==================== FUNGSI ANIMASI LEFT ====================
  const runitContoh1 = (code, forceReset = false) => {
    let prog;
    const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
    if (forceReset) {
      prog = imports + "reset()";
    } else {
      const parsedCode = parseSimpleCommands(code || "left(120)");
      prog = imports + parsedCode;
    }

    try {
      window.Sk.pre = "output2";
      window.Sk.configure({ output: () => {}, read: builtinRead });
      (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh1';

      return window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
      );
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  };

  // ==================== FUNGSI ANIMASI RIGHT ====================
  const runitContoh2 = (code, forceReset = false) => {
    let prog;
    const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
    if (forceReset) {
      prog = imports + "reset()";
    } else {
      const parsedCode = parseSimpleCommands(code || "right(90)");
      prog = imports + parsedCode;
    }

    try {
      window.Sk.pre = "output3";
      window.Sk.configure({ output: () => {}, read: builtinRead });
      (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh2';

      return window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
      );
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  };

  // ==================== FORWARD & BACKWARD FUNCTIONS ====================
  const runitFB = (code, forceReset = false) => {
    setOutputFB('');

    const parsedNewCode = parseSimpleCommands(code || pythonCodeFB);
    const parsedHistory = commandHistoryFB.map(cmd => parseSimpleCommands(cmd)).join('\n');

    const imports = "from turtle import *\nshape('turtle')\n";
    let prog = "";

    if (forceReset) {
      prog = imports + "reset()\nspeed(1)\n" + parsedNewCode;
    } else {
      prog = imports +
        "reset()\nspeed(0)\n" + parsedHistory +
        "\nspeed(1)\n" + parsedNewCode;
    }

    try {
      window.Sk.pre = "outputFB";
      window.Sk.configure({ output: outfFB, read: builtinRead });
      (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-fb';

      window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
      ).then(
        () => console.log('success'),
        (err) => setOutputFB(prev => prev + err.toString())
      );
    } catch (err) {
      setOutputFB(prev => prev + err.toString());
    }
  };

  // ==================== FUNGSI ANIMASI FORWARD ====================
  const runitFBContoh1 = (code, forceReset = false) => {
    let prog;
    const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
    if (forceReset) {
      prog = imports + "reset()";
    } else {
      const parsedCode = parseSimpleCommands(code || "forward(100)");
      prog = imports + parsedCode;
    }

    try {
      window.Sk.pre = "outputFB1";
      window.Sk.configure({ output: () => {}, read: builtinRead });
      (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-fb-contoh1';

      return window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
      );
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  };

  // ==================== FUNGSI ANIMASI BACKWARD ====================
  const runitFBContoh2 = (code, forceReset = false) => {
    let prog;
    const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
    if (forceReset) {
      prog = imports + "reset()";
    } else {
      const parsedCode = parseSimpleCommands(code || "backward(150)");
      prog = imports + parsedCode;
    }

    try {
      window.Sk.pre = "outputFB2";
      window.Sk.configure({ output: () => {}, read: builtinRead });
      (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-fb-contoh2';

      return window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
      );
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  };

  // ==================== HANDLERS LEFT & RIGHT ====================
  const runAndCheck = () => {
    if (!pythonCode.trim()) return;

    const newCommand = pythonCode.trim();
    const newHistory = [...commandHistory, newCommand];

    setCommandHistory(newHistory);
    setPythonCode('');
    runit(newCommand);
    checkCode(newHistory);
  };

  const checkCode = (customCommands = null) => {
    const allCommands = customCommands ? [...customCommands] : [...commandHistory];
    if (pythonCode.trim() && !customCommands) {
      allCommands.push(pythonCode.trim());
    }

    const parsed = parseSimpleCommands(allCommands.join('\n'));
    const lines = parsed.split('\n').map(line => line.trim());

    let newCompletedSteps = [];
    let keys = Object.keys(correctCommands);

    for (let i = 0; i < keys.length; i++) {
      const expectedParsed = parseSimpleCommands(correctCommands[keys[i]]).trim();
      if (lines[i] === expectedParsed) {
        newCompletedSteps.push(keys[i]);
      } else {
        break;
      }
    }

    setCompletedSteps(newCompletedSteps);

    if (newCompletedSteps.length < keys.length) {
      setActiveKey(keys[newCompletedSteps.length]);
    } else {
      setActiveKey(null);
      setTimeout(() => {
        alert('🎉 Selamat! Anda telah menyelesaikan seluruh aktivitas ini!');
      }, 500);
    }
  };

  const undoLastCommand = () => {
    if (commandHistory.length === 0) return;
    const newHistory = commandHistory.slice(0, -1);
    setCommandHistory(newHistory);
    checkCode(newHistory);
    if (newHistory.length > 0) {
      runit(newHistory.join('\n'), true);
    } else {
      runit('', true);
    }
  };

  const resetCode = () => {
    setPythonCode('');
    setCommandHistory([]);
    setOutput('');
    setCompletedSteps([]);
    setActiveKey('1a');
    runit('', true);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const cleaned = pythonCode.replace(/\s*\n\s*/g, '').trim();
      const openParens = (cleaned.match(/\(/g) || []).length;
      const closeParens = (cleaned.match(/\)/g) || []).length;
      if (cleaned && openParens === closeParens) {
        const newHistory = [...commandHistory, cleaned];
        setCommandHistory(newHistory);
        setPythonCode('');
        runit(cleaned);
        checkCode(newHistory);
      }
    }
  };

  // ==================== HANDLERS FORWARD & BACKWARD ====================
  const runAndCheckFB = () => {
    if (!pythonCodeFB.trim()) return;

    const newCommand = pythonCodeFB.trim();
    const newHistory = [...commandHistoryFB, newCommand];

    setCommandHistoryFB(newHistory);
    setPythonCodeFB('');
    runitFB(newCommand);
    checkCodeFB(newHistory);
  };

  const checkCodeFB = (customCommands = null) => {
    const allCommands = customCommands ? [...customCommands] : [...commandHistoryFB];
    if (pythonCodeFB.trim() && !customCommands) {
      allCommands.push(pythonCodeFB.trim());
    }

    const parsed = parseSimpleCommands(allCommands.join('\n'));
    const lines = parsed.split('\n').map(line => line.trim());

    let newCompletedSteps = [];
    let keys = Object.keys(correctCommandsFB);

    for (let i = 0; i < keys.length; i++) {
      const expectedParsed = parseSimpleCommands(correctCommandsFB[keys[i]]).trim();
      if (lines[i] === expectedParsed) {
        newCompletedSteps.push(keys[i]);
      } else {
        break;
      }
    }

    setCompletedStepsFB(newCompletedSteps);

    if (newCompletedSteps.length < keys.length) {
      setActiveKeyFB(keys[newCompletedSteps.length]);
    } else {
      setActiveKeyFB(null);
      setTimeout(() => {
        alert('🎉 Selamat! Anda telah menyelesaikan seluruh aktivitas ini!');
      }, 500);
    }
  };

  const undoLastCommandFB = () => {
    if (commandHistoryFB.length === 0) return;
    const newHistory = commandHistoryFB.slice(0, -1);
    setCommandHistoryFB(newHistory);
    checkCodeFB(newHistory);
    if (newHistory.length > 0) {
      runitFB(newHistory.join('\n'), true);
    } else {
      runitFB('', true);
    }
  };

  const resetCodeFB = () => {
    setPythonCodeFB('');
    setCommandHistoryFB([]);
    setOutputFB('');
    setCompletedStepsFB([]);
    setActiveKeyFB('1a');
    runitFB('', true);
  };

  const handleKeyDownFB = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const cleaned = pythonCodeFB.replace(/\s*\n\s*/g, '').trim();
      const openParens = (cleaned.match(/\(/g) || []).length;
      const closeParens = (cleaned.match(/\)/g) || []).length;
      if (cleaned && openParens === closeParens) {
        const newHistory = [...commandHistoryFB, cleaned];
        setCommandHistoryFB(newHistory);
        setPythonCodeFB('');
        runitFB(cleaned);
        checkCodeFB(newHistory);
      }
    }
  };

  // ==================== PERTANYAAN FUNCTIONS ====================
  const handleAnswerChange = (questionId, answer) => {
    if (questionId === "question1") {
      setSelectedAnswer(answer);
    } else if (questionId === "question2") {
      setSelectedAnswer2(answer);
    }
  };

  const handleSubmit = () => {
    if (currentQuestion === 1) {
      const isCorrect1 = selectedAnswer === 'C';
      setFeedback(prev => ({
        ...prev,
        question1: isCorrect1
          ? 'Benar! Perintah `left 90`, `left 180`, dan `right 90` akan mengubah arah Bidawang dari kanan ke kiri.'
          : 'Salah! Perhatikan bagaimana arah Bidawang berubah setelah setiap perintah rotasi dijalankan.'
      }));
    } else if (currentQuestion === 2) {
      const isCorrect2 = selectedAnswer2 === 'C';
      setFeedback(prev => ({
        ...prev,
        question2: isCorrect2
          ? 'Benar! Setengah putaran ke kanan berarti sudut rotasi yang digunakan adalah 180°.'
          : 'Salah! Pahami kembali hubungan antara sudut rotasi dan besar putaran.'
      }));
      if (isCorrect2) {
        alert('🎉 Semua Jawaban Benar! Materi selanjutnya sudah terbuka 😊');
      }
    }
  };

  const handleAnswerChangeFB = (questionId, answer) => {
    if (questionId === "question1") {
      setSelectedAnswerFB(answer);
    } else if (questionId === "question2") {
      setSelectedAnswer2FB(answer);
    }
  };

  const handleSubmitFB = () => {
    if (currentQuestionFB === 1) {
      const isCorrect1 = selectedAnswerFB === 'B';
      setFeedbackFB(prev => ({
        ...prev,
        question1: isCorrect1
          ? 'Benar! Perintah `forward 100` akan membuat Bidawang bergerak maju sejauh 100 langkah.'
          : 'Salah! Coba cermati lagi perintah yang digunakan untuk membuat Bidawang bergerak ke depan.'
      }));
    } else if (currentQuestionFB === 2) {
      const isCorrect2 = selectedAnswer2FB === 'optionC';
      setFeedbackFB(prev => ({
        ...prev,
        question2: isCorrect2
          ? 'Benar! Arah pergerakan Bidawang ditentukan oleh rotasi `left 90` dan dilanjutkan dengan perintah maju sejauh 100 pixel.'
          : 'Salah! Perhatikan kembali bagaimana arah Bidawang berubah setelah diputar.'
      }));
      if (isCorrect2) {
        alert('🎉 Semua Jawaban Benar! Materi selanjutnya sudah terbuka 😊');
      }
    }
  };

  // ==================== RESIZE HANDLER ====================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ==================== FUNGSI ANIMASI BERULANG ====================
  const startLeftAnimation = async () => {
    if (stopLeftRef.current) return;
    await runitContoh1('', true);
    await runitContoh1('', false);
    timeoutLeftRef.current = setTimeout(() => {
      startLeftAnimation();
    }, 2000);
  };

  const startRightAnimation = async () => {
    if (stopRightRef.current) return;
    await runitContoh2('', true);
    await runitContoh2('', false);
    timeoutRightRef.current = setTimeout(() => {
      startRightAnimation();
    }, 2000);
  };

  const startFBLeftAnimation = async () => {
    if (stopFBLeftRef.current) return;
    await runitFBContoh1('', true);
    await runitFBContoh1('', false);
    timeoutFBLeftRef.current = setTimeout(() => {
      startFBLeftAnimation();
    }, 2000);
  };

  const startFBRightAnimation = async () => {
    if (stopFBRightRef.current) return;
    await runitFBContoh2('', true);
    await runitFBContoh2('', false);
    timeoutFBRightRef.current = setTimeout(() => {
      startFBRightAnimation();
    }, 2000);
  };

  // ==================== INITIALIZE ALL TURTLES ====================
  useEffect(() => {
    const initAllTurtles = () => {
      runit('', true);
      runitContoh1('', true);
      runitContoh2('', true);
      runitFB('', true);
      runitFBContoh1('', true);
      runitFBContoh2('', true);

      startLeftAnimation();
      startRightAnimation();
      startFBLeftAnimation();
      startFBRightAnimation();
    };

    setTimeout(initAllTurtles, 500);

    return () => {
      stopLeftRef.current = true;
      stopRightRef.current = true;
      stopFBLeftRef.current = true;
      stopFBRightRef.current = true;
      if (timeoutLeftRef.current) clearTimeout(timeoutLeftRef.current);
      if (timeoutRightRef.current) clearTimeout(timeoutRightRef.current);
      if (timeoutFBLeftRef.current) clearTimeout(timeoutFBLeftRef.current);
      if (timeoutFBRightRef.current) clearTimeout(timeoutFBRightRef.current);
    };
  }, []);

  // ==================== RE-INITIALIZE SAAT MENU BERUBAH ====================
  useEffect(() => {
    stopLeftRef.current = true;
    stopRightRef.current = true;
    stopFBLeftRef.current = true;
    stopFBRightRef.current = true;
    if (timeoutLeftRef.current) clearTimeout(timeoutLeftRef.current);
    if (timeoutRightRef.current) clearTimeout(timeoutRightRef.current);
    if (timeoutFBLeftRef.current) clearTimeout(timeoutFBLeftRef.current);
    if (timeoutFBRightRef.current) clearTimeout(timeoutFBRightRef.current);

    if (activeMenu === 'leftright') {
      stopLeftRef.current = false;
      stopRightRef.current = false;
      runit('', true);
      runitContoh1('', true);
      runitContoh2('', true);
      startLeftAnimation();
      startRightAnimation();
    } else {
      stopFBLeftRef.current = false;
      stopFBRightRef.current = false;
      runitFB('', true);
      runitFBContoh1('', true);
      runitFBContoh2('', true);
      startFBLeftAnimation();
      startFBRightAnimation();
    }
  }, [activeMenu]);

  // ==================== RENDER LEFT & RIGHT ====================
  const renderLeftRightContent = () => (
    <>
      <h2 style={{
        textAlign: 'center',
        backgroundColor: '#198754',
        color: 'white',
        padding: '10px 20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontWeight: 'bold',
        fontSize: '24px',
        letterSpacing: '1px',
        borderLeft: '10px solid orange'
      }}>
        Left & Right
      </h2>

      <hr />
      <br />

      <h4 style={{
        color: 'black',
        fontSize: '22px',
        fontWeight: 'bold',
        borderLeft: '5px solid #198754',
        paddingLeft: '10px',
        marginBottom: '10px',
      }}>
        Tujuan Pembelajaran
      </h4>
      <ol style={{
        backgroundColor: '#F9F9F9',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        listStylePosition: 'inside',
      }}>
        <li style={{ marginBottom: '8px' }}>
          Memahami cara mengendalikan arah rotasi Bidawang menggunakan left dan right.
        </li>
      </ol>

      <hr />

      <p>
        Perintah left dan right digunakan untuk memutar arah gerakan Bidawang berdasarkan sudut derajat yang diberikan, tanpa harus memindahkan posisinya. Ini berguna untuk mengatur arah Bidawang sebelum melanjutkan dengan perintah lainnya seperti bergerak.
      </p>
      <br />

      <h5 style={{ color: 'black' }}>1. left</h5>
      <p>Memutar arah Bidawang berlawanan arah jarum jam (kiri) sebesar derajat yang ditentukan.</p>
      <p>Contoh:</p>
      <Row className="align-items-center">
        <Col md={6}>
          <CodeMirror
            value="left 120"
            height="400px"
            theme="dark"
            extensions={[python()]}
            editable={false}
            options={{ readOnly: 'nocursor' }}
          />
        </Col>
        <Col md={6} className="text-center">
          <div className="canvas-section" style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            minHeight: '200px'
          }}>
            <div style={{ textAlign: 'center', width: '100%' }} id="mycanvas-contoh1"></div>
          </div>
        </Col>
      </Row>
      <br />
      <p><b>Hasil:</b> Bidawang yang awalnya menghadap ke kanan layar, akan berputar 120 derajat ke kiri.</p>

      <br />

      <h5 style={{ color: 'black' }}>2. right</h5>
      <p>Memutar arah Bidawang searah jarum jam (kanan) sebesar derajat yang ditentukan.</p>
      <p>Contoh:</p>
      <Row className="align-items-center">
        <Col md={6}>
          <CodeMirror
            value="right 90"
            height="400px"
            theme="dark"
            extensions={[python()]}
            editable={false}
            options={{ readOnly: 'nocursor' }}
          />
        </Col>
        <Col md={6} className="text-center">
          <div className="canvas-section" style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            minHeight: '200px'
          }}>
            <div style={{ textAlign: 'center', width: '100%' }} id="mycanvas-contoh2"></div>
          </div>
        </Col>
      </Row>
      <br />
      <p><b>Hasil:</b> Bidawang yang awalnya menghadap ke kanan layar, akan berputar 90 derajat ke kanan.</p>

      <br />
      <hr />

      {/* Latihan Left & Right */}
      <div style={{
        backgroundColor: '#F9F9F9',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: 'auto',
      }}>
        <h4 style={{
          color: 'black',
          fontSize: '22px',
          fontWeight: 'bold',
          borderLeft: '5px solid #198754',
          paddingLeft: '10px',
          marginBottom: '15px',
        }}>
          Latihan menggunakan left dan right 🐢
        </h4>
        <p style={{ color: '#444', lineHeight: '1.6' }}>
          Untuk lebih mudah memahami cara kerja perintah <code>left</code> dan <code>right</code>, ikuti instruksi di bawah ini.
        </p>
        <ul style={{ color: '#444', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Tuliskan kode pada text editor sesuai instruksi di bawah ini.</li>
          <li>Klik <b>Run Code</b> atau tekan <b>Enter</b> untuk menjalankan perintah.</li>
          <li>Jika perintah yang dijalankan benar, maka langkah selanjutnya akan terbuka.</li>
          <li>Jika perintah yang dijalankan salah, klik <b>Undo</b> terlebih dahulu sebelum mencoba lagi.</li>
        </ul>

        <Row>
          <Col xs={12} md={3} style={{ fontSize: '15px', marginBottom: isMobile ? '20px' : '0' }}>
            <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
              {[
                { step: '1a', title: 'Berputar ke kiri', code: 'left 90', description: 'Buat bidawang berputar 90 derajat ke kiri dengan perintah dibawah ini.' },
                { step: '1b', title: 'Berputar ke kanan', code: 'right 180', description: 'Kemudian lanjutkan dengan perintah dibawah ini untuk memutar bidawang ke kanan sebesar 180 derajat.' }
              ].map((step, index) => {
                const isDisabled = index > 0 && !completedSteps.includes(`1${String.fromCharCode(96 + index)}`);
                return (
                  <Accordion.Item
                    eventKey={step.step}
                    key={index}
                    style={{ opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
                  >
                    <Accordion.Header>
                      <b>{step.title}</b>
                      {completedSteps.includes(step.step) && (
                        <BsCheckCircle style={{ color: 'green', marginLeft: 10 }} />
                      )}
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>{step.description}</p>
                      <pre style={{
                        userSelect: 'none',
                        pointerEvents: 'none',
                        border: '1px solid black',
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <code draggable={false}>{step.code}</code>
                      </pre>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Col>

          <Col xs={12} md={9}>
            <div style={{
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '15px',
              display: 'flex',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              gap: '20px',
              flexWrap: 'wrap',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <div style={{
                flex: 1,
                minWidth: 0,
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <CodeMirror
                  value={pythonCode}
                  placeholder="// Ketik kode disini!"
                  height="150px"
                  theme="dark"
                  extensions={[closeBrackets({ brackets: '' })]}
                  onChange={(value) => setPythonCode(value)}
                  onKeyDown={handleKeyDown}
                />
                <div style={{
                  marginTop: '5px',
                  marginBottom: '5px',
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  <Button variant="success" disabled={!pythonCode.trim()} onClick={runAndCheck}>
                    Run Code
                  </Button>
                  <Button variant="warning" disabled={commandHistory.length === 0} onClick={undoLastCommand}>
                    Undo
                  </Button>
                  <Button variant="secondary" onClick={resetCode}>
                    <BsArrowClockwise /> Reset
                  </Button>
                </div>
                <pre style={{
                  height: '100px',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid black',
                  borderRadius: '4px',
                  padding: '10px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  marginTop: '10px',
                }}>
                  <b>History Commands:</b>
                  <br />
                  {commandHistory.map((cmd, idx) => `> ${cmd}\n`)}
                </pre>
                <pre className="output" style={{ height: 60, overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  {output}
                </pre>
              </div>

              <div className="canvas-section" style={{
                flex: isMobile ? 'none' : '0 0 400px',
                width: '100%',
                maxWidth: '400px',
                maxHeight: 400,
                alignSelf: isMobile ? 'center' : 'flex-start',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                minHeight: '200px'
              }}>
                <div id="mycanvas" style={{ width: '100%' }}></div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <br />
      <hr />

      <div style={{
        backgroundColor: '#F9F9F9',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: 'auto',
        borderLeft: '5px solid #198754',
        borderRight: '5px solid #198754',
      }}>
        <h4 style={{
          color: 'black',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
        }}>
          Kesimpulan
        </h4>
        <p>
          Perintah `left` dan `right` memungkinkan pengaturan arah gerakan bidawang dengan rotasi ke kiri atau ke kanan berdasarkan derajat yang ditentukan. Perintah ini sangat berguna untuk kontrol arah sebelum melakukan perintah lain dalam pembuatan gambar atau pola.
        </p>
      </div>

      <br />
      <hr />

      {/* Pertanyaan Left & Right */}
      <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <h4 style={{ fontWeight: "bold", color: 'black' }}>Pertanyaan</h4>
          </Accordion.Header>
          <Accordion.Body>
            <Form>
              {currentQuestion === 1 && (
                <Form.Group controlId="question1">
                  <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
                    <b>Soal 1 dari 2:</b>
                    <p>Perhatikan kode perintah dibawah ini:</p>
                    <pre style={{ border: '1px solid #000000', borderRadius: '8px', padding: '10px' }}>
                      <code>{`left 90\nleft 180\nright 90`}</code>
                    </pre>
                    <p>Jika Bidawang awalnya menghadap ke kanan, arah bidawang setelah kode perintah dijalankan adalah ...</p>
                  </Form.Label>

                  {[
                    { key: 'A', label: 'Kanan' },
                    { key: 'B', label: 'Atas' },
                    { key: 'C', label: 'Kiri' },
                    { key: 'D', label: 'Bawah' },
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={selectedAnswer === key ? "success" : "outline-success"}
                      onClick={() => handleAnswerChange("question1", key)}
                      className="w-100 mb-2 text-start"
                    >
                      {key}. {label}
                    </Button>
                  ))}

                  {feedback.question1 && (
                    <Alert variant={feedback.question1.includes('Benar') ? "success" : "danger"} className="mt-3">
                      {feedback.question1}
                    </Alert>
                  )}
                </Form.Group>
              )}

              {currentQuestion === 2 && (
                <Form.Group controlId="question2">
                  <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
                    <b>Soal 2 dari 2:</b>
                    <p>Seorang siswa ingin memutar arah Bidawang ke kanan sebanyak setengah putaran. Sudut yang perlu digunakan adalah ...</p>
                  </Form.Label>

                  {[
                    { key: 'A', label: '90°' },
                    { key: 'B', label: '120°' },
                    { key: 'C', label: '180°' },
                    { key: 'D', label: '360°' },
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={selectedAnswer2 === key ? "success" : "outline-success"}
                      onClick={() => handleAnswerChange("question2", key)}
                      className="w-100 mb-2 text-start"
                    >
                      {key}. {label}
                    </Button>
                  ))}

                  {feedback.question2 && (
                    <Alert variant={feedback.question2.includes('Benar') ? "success" : "danger"} className="mt-3">
                      {feedback.question2}
                    </Alert>
                  )}
                </Form.Group>
              )}

              <div className="text-center mt-4 d-flex justify-content-between">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
                  disabled={currentQuestion === 1}
                >
                  Sebelumnya
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                  Periksa Jawaban
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentQuestion((prev) => Math.min(2, prev + 1))}
                  disabled={
                    (currentQuestion === 1 && !feedback.question1?.includes('Benar')) ||
                    (currentQuestion === 2 && !feedback.question2?.includes('Benar'))
                  }
                >
                  Selanjutnya
                </Button>
              </div>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );

  // ==================== RENDER FORWARD & BACKWARD ====================
  const renderForwardBackwardContent = () => (
    <>
      <h2 style={{
        textAlign: 'center',
        backgroundColor: '#198754',
        color: 'white',
        padding: '10px 20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontWeight: 'bold',
        fontSize: '24px',
        letterSpacing: '1px',
        borderLeft: '10px solid orange'
      }}>
        Forward & Backward
      </h2>

      <hr />
      <br />

      <h4 style={{
        color: 'black',
        fontSize: '22px',
        fontWeight: 'bold',
        borderLeft: '5px solid #198754',
        paddingLeft: '10px',
        marginBottom: '10px',
      }}>
        Tujuan Pembelajaran
      </h4>
      <ol style={{
        backgroundColor: '#F9F9F9',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        listStylePosition: 'inside',
      }}>
        <li style={{ marginBottom: '8px' }}>
          Memahami cara menggerakkan Bidawang ke depan dan ke belakang menggunakan forward dan backward.
        </li>
      </ol>

      <hr />

      <p>
        Perintah `forward` dan `backward` digunakan untuk menggerakkan Bidawang ke arah depan (forward) searah arah yang sedang dihadapi Bidawang dan belakang (backward) berlawanan arah dengan yang sedang dihadapi Bidawang, berdasarkan jarak yang ditentukan dalam satuan piksel (pixel).
      </p>

      <h5 style={{ color: 'black' }}>1. forward</h5>
      <p>Menggerakkan Bidawang ke depan sejauh jarak yang ditentukan (dalam piksel), dalam arah yang sedang dihadapi oleh Bidawang.</p>
      <Row className="align-items-center">
        <Col md={6}>
          <CodeMirror
            value="forward 100"
            height="400px"
            theme="dark"
            extensions={[python()]}
            editable={false}
            options={{ readOnly: 'nocursor' }}
          />
        </Col>
        <Col md={6} className="text-center">
          <div className="canvas-section" style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            minHeight: '200px'
          }}>
            <div style={{ textAlign: 'center', width: '100%' }} id="mycanvas-fb-contoh1"></div>
          </div>
        </Col>
      </Row>
      <br />
      <p><b>Hasil:</b> Bidawang akan bergerak sejauh 100 piksel ke arah yang dihadapnya.</p>

      <br />

      <h5 style={{ color: 'black' }}>2. backward</h5>
      <p>Menggerakkan Bidawang ke belakang sejauh jarak yang ditentukan (dalam piksel), dalam arah berlawanan dengan arah yang sedang dihadapi oleh bidawang.</p>
      <Row className="align-items-center">
        <Col md={6}>
          <CodeMirror
            value="backward 150"
            height="400px"
            theme="dark"
            extensions={[python()]}
            editable={false}
            options={{ readOnly: 'nocursor' }}
          />
        </Col>
        <Col md={6} className="text-center">
          <div className="canvas-section" style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            minHeight: '200px'
          }}>
            <div style={{ textAlign: 'center', width: '100%' }} id="mycanvas-fb-contoh2"></div>
          </div>
        </Col>
      </Row>
      <br />
      <p><b>Hasil:</b> Bidawang akan mundur sejauh 150 piksel dari arah yang dihadapnya.</p>

      <br />
      <hr />

      {/* Latihan Forward & Backward */}
      <div style={{
        backgroundColor: '#F9F9F9',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: 'auto',
      }}>
        <h4 style={{
          color: 'black',
          fontSize: '22px',
          fontWeight: 'bold',
          borderLeft: '5px solid #198754',
          paddingLeft: '10px',
          marginBottom: '15px',
        }}>
          Latihan menggunakan forward dan backward 🐢
        </h4>
        <p style={{ color: '#444', lineHeight: '1.6' }}>
          Untuk lebih mudah memahami cara kerja perintah <code>forward</code> dan <code>backward</code>, ikuti instruksi di bawah ini.
        </p>
        <ul style={{ color: '#444', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Tuliskan kode pada text editor sesuai instruksi di bawah ini.</li>
          <li>Klik <b>Run Code</b> atau tekan <b>Enter</b> untuk menjalankan perintah.</li>
          <li>Jika perintah yang dijalankan benar, maka langkah selanjutnya akan terbuka.</li>
          <li>Jika perintah yang dijalankan salah, klik <b>Undo</b> terlebih dahulu sebelum mencoba lagi.</li>
        </ul>

        <Row>
          <Col xs={12} md={3} style={{ fontSize: '15px', marginBottom: isMobile ? '20px' : '0' }}>
            <Accordion activeKey={activeKeyFB} onSelect={(key) => setActiveKeyFB(key)}>
              {[
                { step: '1a', title: 'Maju', code: 'forward 100', description: 'Gerakkan Bidawang maju sejauh 100 langkah dengan perintah dibawah ini:' },
                { step: '1b', title: 'Berputar ke kanan', code: 'right 90', description: 'Kemudian lanjutkan dengan perintah dibawah ini untuk membuat Bidawang berputar 90 derajat ke kanan:' },
                { step: '1c', title: 'Mundur', code: 'backward 100', description: 'Gerakkan lagi bidawang mundur sejauh 100 langkah:' }
              ].map((step, index) => {
                const isDisabled = index > 0 && !completedStepsFB.includes(`1${String.fromCharCode(96 + index)}`);
                return (
                  <Accordion.Item
                    eventKey={step.step}
                    key={index}
                    style={{ opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
                  >
                    <Accordion.Header>
                      <b>{step.title}</b>
                      {completedStepsFB.includes(step.step) && (
                        <BsCheckCircle style={{ color: 'green', marginLeft: 10 }} />
                      )}
                    </Accordion.Header>
                    <Accordion.Body>
                      <p>{step.description}</p>
                      <pre style={{
                        userSelect: 'none',
                        pointerEvents: 'none',
                        border: '1px solid black',
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <code draggable={false}>{step.code}</code>
                      </pre>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Col>

          <Col xs={12} md={9}>
            <div style={{
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '15px',
              display: 'flex',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              gap: '20px',
              flexWrap: 'wrap',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <div style={{
                flex: 1,
                minWidth: 0,
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <CodeMirror
                  value={pythonCodeFB}
                  placeholder="// Ketik kode disini!"
                  height="150px"
                  theme="dark"
                  extensions={[closeBrackets({ brackets: '' })]}
                  onChange={(value) => setPythonCodeFB(value)}
                  onKeyDown={handleKeyDownFB}
                />
                <div style={{
                  marginTop: '5px',
                  marginBottom: '5px',
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  <Button variant="success" disabled={!pythonCodeFB.trim()} onClick={runAndCheckFB}>
                    Run Code
                  </Button>
                  <Button variant="warning" disabled={commandHistoryFB.length === 0} onClick={undoLastCommandFB}>
                    Undo
                  </Button>
                  <Button variant="secondary" onClick={resetCodeFB}>
                    <BsArrowClockwise /> Reset
                  </Button>
                </div>
                <pre style={{
                  height: '100px',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid black',
                  borderRadius: '4px',
                  padding: '10px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  marginTop: '10px',
                }}>
                  <b>History Commands:</b>
                  <br />
                  {commandHistoryFB.map((cmd, idx) => `> ${cmd}\n`)}
                </pre>
                <pre className="output" style={{ height: 60, overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  {outputFB}
                </pre>
              </div>

              <div className="canvas-section" style={{
                flex: isMobile ? 'none' : '0 0 400px',
                width: '100%',
                maxWidth: '400px',
                maxHeight: 400,
                alignSelf: isMobile ? 'center' : 'flex-start',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                minHeight: '200px'
              }}>
                <div id="mycanvas-fb" style={{ width: '100%' }}></div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <br />
      <hr />

      <div style={{
        backgroundColor: '#F9F9F9',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: 'auto',
        borderLeft: '5px solid #198754',
        borderRight: '5px solid #198754',
      }}>
        <h4 style={{
          color: 'black',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
        }}>
          Kesimpulan
        </h4>
        <p>
          Perintah <code>forward</code> dan <code>backward</code> digunakan untuk menggerakkan Bidawang ke depan atau ke belakang sejauh jarak yang ditentukan dalam piksel. Perintah <code>forward</code> dan <code>backward</code> sering dikombinasikan dengan perintah rotasi seperti `left` dan `right` untuk membuat pola atau gambar yang lebih kompleks.
        </p>
      </div>

      <br />
      <hr />

      {/* Pertanyaan Forward & Backward */}
      <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <h4 style={{ fontWeight: "bold", color: 'black' }}>Pertanyaan</h4>
          </Accordion.Header>
          <Accordion.Body>
            <Form>
              {currentQuestionFB === 1 && (
                <Form.Group controlId="question1">
                  <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
                    <b>Soal 1 dari 2:</b>
                    <p>Perintah yang digunakan untuk menggerakan bidawang maju 100 piksel adalah ...</p>
                  </Form.Label>

                  {[
                    { key: 'A', label: 'backward 100' },
                    { key: 'B', label: 'forward 100' },
                    { key: 'C', label: 'left 100' },
                    { key: 'D', label: 'right 100' },
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={selectedAnswerFB === key ? "success" : "outline-success"}
                      onClick={() => handleAnswerChangeFB("question1", key)}
                      className="w-100 mb-2 text-start"
                    >
                      {key}. {label}
                    </Button>
                  ))}

                  {feedbackFB.question1 && (
                    <Alert variant={feedbackFB.question1.includes('Benar') ? "success" : "danger"} className="mt-3">
                      {feedbackFB.question1}
                    </Alert>
                  )}
                </Form.Group>
              )}

              {currentQuestionFB === 2 && (
                <Form.Group controlId="question2">
                  <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
                    <b>Soal 2 dari 2:</b>
                    <p>Perhatikan kode dibawah ini:</p>
                    <pre style={{ border: '1px solid #000000', borderRadius: '8px', padding: '10px' }}>
                      <code>{`left 90\nforward 100`}</code>
                    </pre>
                    <p>Jika awalnya Bidawang menghadap ke kanan, posisi bidawang setelah kode dijalankan adalah ...</p>
                  </Form.Label>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                      { key: 'optionA', label: '⬆️ Atas' },
                      { key: 'optionB', label: '⬇️ Bawah' },
                      { key: 'optionC', label: '⬅️ Kiri' },
                      { key: 'optionD', label: '➡️ Kanan' },
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={selectedAnswer2FB === key ? "success" : "outline-secondary"}
                        onClick={() => handleAnswerChangeFB("question2", key)}
                        style={{ fontSize: '18px', padding: '20px', minWidth: '100px' }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>

                  {feedbackFB.question2 && (
                    <Alert variant={feedbackFB.question2.includes('Benar') ? "success" : "danger"} className="mt-3">
                      {feedbackFB.question2}
                    </Alert>
                  )}
                </Form.Group>
              )}

              <div className="text-center mt-4 d-flex justify-content-between">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentQuestionFB((prev) => Math.max(1, prev - 1))}
                  disabled={currentQuestionFB === 1}
                >
                  Sebelumnya
                </Button>
                <Button variant="primary" onClick={handleSubmitFB}>
                  Periksa Jawaban
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentQuestionFB((prev) => Math.min(2, prev + 1))}
                  disabled={
                    (currentQuestionFB === 1 && !feedbackFB.question1?.includes('Benar')) ||
                    (currentQuestionFB === 2 && !feedbackFB.question2?.includes('Benar'))
                  }
                >
                  Selanjutnya
                </Button>
              </div>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div style={{
      fontFamily: 'Verdana, sans-serif',
      display: "flex",
      height: "100vh",
      flexDirection: "row",
      overflow: "hidden",
      position: "fixed",
      width: '100%'
    }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#198754',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="light" size="sm" onClick={() => setCollapsed(!collapsed)}>
            <FaBars />
          </Button>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            🐢 Tutorial Turtle
          </span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
          <span style={{ color: 'white' }}>|</span>
          <span style={{ color: 'white' }}>Tutorial</span>
        </div>
      </nav>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? "50px" : "250px",
        transition: "width 0.3s",
        backgroundColor: "#f0f0f0",
        position: "sticky",
        top: 60,
        zIndex: 10,
        flexShrink: 0,
        overflow: 'auto',
        paddingBottom: 80,
        marginTop: '60px'
      }}>
        <div style={{ padding: collapsed ? '10px' : '15px' }}>
          {!collapsed && <h6 className="mb-3" style={{ fontWeight: 'bold', color: '#198754' }}>📚 Materi</h6>}
          
          <Button
            variant={activeMenu === 'leftright' ? "success" : "outline-success"}
            className="w-100 mb-2 text-start"
            onClick={() => setActiveMenu('leftright')}
            style={{ justifyContent: 'flex-start' }}
          >
            {collapsed ? '↔️' : 'Left & Right'}
          </Button>
          
          <Button
            variant={activeMenu === 'forwardbackward' ? "success" : "outline-success"}
            className="w-100 mb-2 text-start"
            onClick={() => setActiveMenu('forwardbackward')}
            style={{ justifyContent: 'flex-start' }}
          >
            {collapsed ? '⬆️' : 'Forward & Backward'}
          </Button>

          {/* Tambahan: Link ke Tutorial Lengkap */}
          <hr className="my-3" style={{ borderColor: '#dee2e6' }} />
          <div style={{ padding: '0 4px' }}>
            <a
              href="https://bidawang-geometry-app.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#198754',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.9rem',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#e8f5e9',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c8e6c9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f5e9'}
            >
              <span style={{ fontSize: '1.2rem' }}>📖</span>
              {!collapsed && 'Tutorial Lengkap'}
              {!collapsed && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginLeft: 'auto' }}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              )}
            </a>
            {!collapsed && (
              <p style={{
                fontSize: '0.7rem',
                color: '#6c757d',
                marginTop: '6px',
                paddingLeft: '12px',
                lineHeight: '1.4'
              }}>
                Akses semua materi turtle interaktif
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flexGrow: 1,
        overflowY: "auto",
        backgroundColor: "#fff",
        marginTop: '60px',
        paddingTop: '20px',
        paddingBottom: '40px'
      }}>
        <div style={{
          paddingLeft: isMobile ? 15 : 40,
          paddingRight: isMobile ? 15 : 40,
        }}>
          {activeMenu === 'leftright' ? renderLeftRightContent() : renderForwardBackwardContent()}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;