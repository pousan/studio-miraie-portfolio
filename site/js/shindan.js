(function () {
  'use strict';

  var STORAGE_KEY = 'studio_miraie_shindan_v1';
  var STATE_VERSION = 1;

  // Question definitions matching research.md §3
  var QUESTIONS = [
    {
      id: 'Q1',
      text: 'お店のホームページはありますか？',
      supplement: '',
      options: [
        { value: 'site', label: 'お店のホームページがある' },
        { value: 'social', label: 'Instagramや店舗紹介ページだけを使っている' },
        { value: 'none', label: 'どちらも使っていない' },
        { value: 'unknown', label: 'わからない' }
      ]
    },
    {
      id: 'Q2',
      text: 'ホームページのメニューや営業時間は、スマホで拡大せずに読めますか？',
      supplement: '',
      options: [
        { value: 'yes', label: '読める' },
        { value: 'issue', label: '拡大が必要・読みにくい箇所がある' },
        { value: 'unknown', label: 'まだ確認していない' }
      ]
    },
    {
      id: 'Q3',
      text: '営業時間やメニューが変わったとき、主な案内先を更新できていますか？',
      supplement: '主な案内先とは、ホームページ・Instagram・Googleマップなど、お客様に見てほしい場所です。',
      options: [
        { value: 'ready', label: '自分やスタッフですぐ更新できる' },
        { value: 'delegate', label: '依頼先に頼めば更新できる' },
        { value: 'issue', label: '更新に困る・古い情報が残る' },
        { value: 'unknown', label: '案内先がない・わからない' }
      ]
    },
    {
      id: 'Q4',
      text: 'Googleマップのお店情報は、現在の営業内容と合っていますか？',
      supplement: '',
      options: [
        { value: 'yes', label: '住所・営業時間・連絡先を確認し、合っている' },
        { value: 'issue', label: '古い情報や不足がある' },
        { value: 'absent', label: 'お店が表示されていない' },
        { value: 'unknown', label: '確認していない・わからない' }
      ]
    },
    {
      id: 'Q5',
      text: 'Instagramから、営業時間・場所・メニューの案内へ迷わず進めますか？',
      supplement: '',
      options: [
        { value: 'yes', label: 'プロフィールのリンクなどから進める' },
        { value: 'issue', label: '投稿を探さないとわからない・案内が不足' },
        { value: 'unused', label: 'Instagramは使っていない' },
        { value: 'unknown', label: 'わからない' }
      ]
    },
    {
      id: 'Q6',
      text: '来店前に連絡したいお客様へ、連絡方法をわかりやすく案内していますか？',
      supplement: '予約を受け付けていないお店でも、必要な問い合わせ方法があれば構いません。',
      options: [
        { value: 'yes', label: '電話・問い合わせ・予約先などを案内している' },
        { value: 'issue', label: '案内しているが探しにくい・使いにくい' },
        { value: 'absent', label: '連絡を受けたいが案内先がない' },
        { value: 'notneeded', label: '事前連絡を受け付けていない' },
        { value: 'unknown', label: 'わからない' }
      ]
    },
    {
      id: 'Q7',
      text: '今のお店の雰囲気やメニューが伝わる写真を、Web上に載せていますか？',
      supplement: '',
      options: [
        { value: 'yes', label: '今の外観・店内・主なメニューが伝わる' },
        { value: 'issue', label: '暗い・古い・一部しか伝わらない' },
        { value: 'absent', label: '写真を載せていない' },
        { value: 'unknown', label: 'わからない' }
      ]
    }
  ];

  var QUESTION_MAP = {};
  for (var i = 0; i < QUESTIONS.length; i++) {
    QUESTION_MAP[QUESTIONS[i].id] = QUESTIONS[i];
  }

  // Priority order for "まず見直すこと": Q3・Q4 -> Q2・Q6 -> Q5・Q7
  var PRIORITY_ORDER = ['Q3', 'Q4', 'Q2', 'Q6', 'Q5', 'Q7'];

  // Good items rules ("回答上、整っていること")
  var GOOD_RULES = {
    Q1: {
      site: 'お店のホームページを用意している'
    },
    Q2: {
      yes: 'ホームページのメニューや営業時間が、スマートフォンで拡大せずに読める'
    },
    Q3: {
      ready: '営業時間やメニューが変わったとき、自分やスタッフですぐ主な案内先を更新できる',
      delegate: '更新の依頼先あり（営業時間やメニューが変わったとき、依頼先に頼めば更新できる）'
    },
    Q4: {
      yes: 'Googleマップの住所・営業時間・連絡先を確認し、現在の営業内容と合っている'
    },
    Q5: {
      yes: 'Instagramのプロフィールリンクなどから、営業時間・場所・メニューの案内へ迷わず進める'
    },
    Q6: {
      yes: '来店前に連絡したいお客様へ、電話・問い合わせ・予約先などの連絡方法を案内している'
    },
    Q7: {
      yes: '今の外観・店内・主なメニューが伝わる写真をWeb上に載せている'
    }
  };

  // Review items rules ("まず見直すこと": あなたの回答 -> 確認する理由 -> 自分でできる行動)
  var REVIEW_RULES = {
    Q3: {
      issue: {
        title: '主な案内先の更新手順と管理方法を見直しましょう',
        answerLabel: '更新に困る・古い情報が残る',
        body: '来店前のお客様が見る営業時間やメニューに古い情報が残ると、営業日や提供内容の行き違いにつながります。まずはホームページ・Instagram・Googleマップのうち「お客様に一番見てほしい案内先」を決め、ログイン情報や依頼先の連絡先を手元にまとめて、変更時にすぐ書き換えられる手順を整えましょう。'
      }
    },
    Q4: {
      issue: {
        title: 'Googleマップの営業時間を確認しましょう',
        answerLabel: '古い情報や不足がある',
        body: '来店前に確認する情報と実際の営業内容を揃えるため、まず通常営業時間と臨時休業の案内を確認してください。ホームページやInstagramの案内も見比べましょう。'
      },
      absent: {
        title: 'Googleマップのお店情報の表示を確認・整えましょう',
        answerLabel: 'お店が表示されていない',
        body: '初めて訪れるお客様が場所や営業時間を調べられるよう、地図上で基本情報を確認できる状態にしておくことが大切です。まずはGoogleマップで店名と住所を検索して既存の地点情報がないか確かめ、表示がない場合はGoogleビジネスプロフィールから店舗情報の登録を検討してください。'
      }
    },
    Q2: {
      issue: {
        title: 'スマホでメニューや営業時間が拡大せずに読めるか見直しましょう',
        answerLabel: '拡大が必要・読みにくい箇所がある',
        body: 'スマートフォンで来店前の情報を探すお客様にとって、文字が小さすぎるページや画像・PDFだけのメニュー表は読む負担が大きくなります。ご自身のスマートフォンでホームページを開き、営業時間・定休日・主なメニュー・住所が拡大操作なしで読めるよう、本文テキストでの記載や文字サイズを見直しましょう。'
      }
    },
    Q6: {
      issue: {
        title: '連絡方法の案内を見つけやすい場所にまとめましょう',
        answerLabel: '案内しているが探しにくい・使いにくい',
        body: '来店前に確認したいことがあるお客様が迷わないよう、連絡手段と受付条件をひと目でわかる位置に置くことが大切です。ホームページの営業案内欄やInstagramのプロフィールに、電話番号や問い合わせ方法とあわせて「お電話は営業時間内にお願いします」などの目安を添えて整理しましょう。'
      },
      absent: {
        title: '無理なく対応できる連絡窓口をひとつ案内しましょう',
        answerLabel: '連絡を受けたいが案内先がない',
        body: 'お客様からの事前確認や問い合わせを受けたい場合、連絡先が明記されていると来店の安心につながります。電話・問い合わせフォーム・SNSのメッセージなど、営業の妨げにならずに確認できる方法をひとつ選び、対応できる時間帯と一緒に案内先へ記載しましょう。'
      }
    },
    Q5: {
      issue: {
        title: 'Instagramのプロフィールから基本情報へ進めるように整えましょう',
        answerLabel: '投稿を探さないとわからない・案内が不足',
        body: '日々の投稿が増えると、過去の投稿に書いた営業時間やメニューを初めてのお客様が見つけにくくなります。Instagramのプロフィール文に営業時間・定休日・住所（最寄り）を記載し、ストーリーズのハイライト固定やプロフィールリンクからメニュー・場所の案内へすぐ進めるように整えましょう。'
      }
    },
    Q7: {
      issue: {
        title: '今のお店の雰囲気やメニューが伝わる写真に差し替えましょう',
        answerLabel: '暗い・古い・一部しか伝わらない',
        body: '初めてのお店に入るお客様は、入り口の様子や席の雰囲気、メニューの写真を見て来店をイメージします。自然光が入る明るい時間帯にスマートフォンで「外観（入り口）」「店内の席」「定番メニュー」を撮影し、古い写真や暗い写真と入れ替えましょう。'
      },
      absent: {
        title: '外観・店内・主なメニューの写真を1枚ずつ載せましょう',
        answerLabel: '写真を載せていない',
        body: '文字の案内だけでなく写真があることで、初めてのお客様がお店の雰囲気を知り安心して来店しやすくなります。まずはスマートフォンで「お店の外観」「店内の様子」「代表的なメニュー」の3枚を撮影し、GoogleマップやInstagram、ホームページに掲載しましょう。'
      }
    }
  };

  // Unknown items rules ("まだ確認していないこと": 確認手順付き)
  var UNKNOWN_RULES = {
    Q1: {
      title: 'お店のホームページやWeb上の案内先の有無を確認する',
      answerLabel: 'わからない',
      procedure: '確認手順：スマートフォンで「お店の名前 ＋ 地域名」を検索し、公式ホームページ、Instagram、グルメサイト、Googleマップのどれが表示されるかを書き出してみてください。'
    },
    Q2: {
      title: 'スマートフォンの画面でホームページの文字が読めるか確認する',
      answerLabel: 'まだ確認していない',
      procedure: '確認手順：ご自身のスマートフォンでお店のホームページを開き、画面をピンチ操作で拡大せずに「営業時間」「定休日」「メニューと価格」「住所・行き方」が無理なく読めるか確かめてみてください。'
    },
    Q3: {
      title: '主な案内先と更新の方法を確認する',
      answerLabel: '案内先がない・わからない',
      procedure: '確認手順：お客様に最新情報を見てほしい場所（ホームページ・Instagram・Googleマップなど）をひとつ決め、誰がログイン情報を持っているか、または誰に連絡すれば変更できるかを確認して控えておきましょう。'
    },
    Q4: {
      title: 'Googleマップに表示されるお店情報を確認する',
      answerLabel: '確認していない・わからない',
      procedure: '確認手順：Googleマップで店名を検索し、「住所（ピンの位置）」「営業時間・定休日」「電話番号」「Webサイトへのリンク」が現在の営業内容と合っているかひとつずつ照らし合わせてみてください。'
    },
    Q5: {
      title: 'Instagramのプロフィール画面から基本情報にたどり着けるか確認する',
      answerLabel: 'わからない',
      procedure: '確認手順：お店のInstagramプロフィール画面を開き、過去の投稿をいくつも遡らずに「営業時間」「定休日」「場所」「メニュー」が3タップ以内でわかるか確認してみてください。'
    },
    Q6: {
      title: 'お客様向けの連絡方法の案内を確認する',
      answerLabel: 'わからない',
      procedure: '確認手順：ホームページやInstagram、Googleマップを開き、お客様が連絡したいときに電話番号や問い合わせ方法（または「事前連絡・予約は受け付けていません」という案内）がすぐ見つかるか確認してみてください。'
    },
    Q7: {
      title: 'Web上に載っている写真の内容を確認する',
      answerLabel: 'わからない',
      procedure: '確認手順：GoogleマップやInstagram、ホームページに掲載されている写真を見返し、「今の外観」「店内の雰囲気」「現在提供している主なメニュー」が明るくわかりやすく載っているか確認してみてください。'
    }
  };

  function getActiveQuestionIds(answers) {
    var ans = answers || {};
    var ids = ['Q1'];
    if (ans.Q1 === 'site') {
      ids.push('Q2');
    }
    ids.push('Q3', 'Q4', 'Q5', 'Q6', 'Q7');
    return ids;
  }

  function getOptionLabel(qId, value) {
    var q = QUESTION_MAP[qId];
    if (!q) return '';
    for (var i = 0; i < q.options.length; i++) {
      if (q.options[i].value === value) {
        return q.options[i].label;
      }
    }
    return '';
  }

  function getFirstUnansweredQuestionId(answers) {
    var ans = answers || {};
    var activeIds = getActiveQuestionIds(ans);
    for (var i = 0; i < activeIds.length; i++) {
      var qId = activeIds[i];
      var val = ans[qId];
      if (!val || !getOptionLabel(qId, val)) {
        return qId;
      }
    }
    return null;
  }

  /**
   * Pure function evaluate(answers) as specified in research.md §4.
   * Generates structured result without any overall score.
   */
  function evaluate(rawAnswers) {
    var answers = {};
    if (rawAnswers && typeof rawAnswers === 'object') {
      var keys = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'];
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        var rawVal = rawAnswers[key];
        if (typeof rawVal === 'string' && getOptionLabel(key, rawVal)) {
          answers[key] = rawVal;
        }
      }
    }

    // Discard Q2 if Q1 is not 'site'
    if (answers.Q1 !== 'site') {
      delete answers.Q2;
    }

    var activeQuestionIds = getActiveQuestionIds(answers);
    var unansweredIds = [];
    for (var a = 0; a < activeQuestionIds.length; a++) {
      var reqQId = activeQuestionIds[a];
      if (!answers[reqQId]) {
        unansweredIds.push(reqQId);
      }
    }
    var isComplete = unansweredIds.length === 0;

    // 1. Good items ("回答上、整っていること")
    var goodItems = [];
    for (var i = 0; i < activeQuestionIds.length; i++) {
      var qId = activeQuestionIds[i];
      var val = answers[qId];
      if (val && GOOD_RULES[qId] && GOOD_RULES[qId][val]) {
        goodItems.push({
          questionId: qId,
          value: val,
          text: GOOD_RULES[qId][val]
        });
      }
    }

    // 2. Review items ("まず見直すこと", sorted by PRIORITY_ORDER: Q3・Q4 -> Q2・Q6 -> Q5・Q7)
    var reviewItems = [];
    for (var p = 0; p < PRIORITY_ORDER.length; p++) {
      var prioQId = PRIORITY_ORDER[p];
      if (prioQId === 'Q2' && answers.Q1 !== 'site') {
        continue;
      }
      var ansVal = answers[prioQId];
      if (ansVal && REVIEW_RULES[prioQId] && REVIEW_RULES[prioQId][ansVal]) {
        var rule = REVIEW_RULES[prioQId][ansVal];
        reviewItems.push({
          questionId: prioQId,
          value: ansVal,
          title: rule.title,
          answerLabel: rule.answerLabel,
          body: rule.body
        });
      }
    }

    var primaryReviewItems = reviewItems.slice(0, 3);
    var remainingReviewItems = reviewItems.slice(3);

    // 3. Unknown items ("まだ確認していないこと")
    var unknownItems = [];
    for (var u = 0; u < activeQuestionIds.length; u++) {
      var uQId = activeQuestionIds[u];
      var uVal = answers[uQId];
      if (uVal === 'unknown' && UNKNOWN_RULES[uQId]) {
        unknownItems.push({
          questionId: uQId,
          value: uVal,
          title: UNKNOWN_RULES[uQId].title,
          answerLabel: UNKNOWN_RULES[uQId].answerLabel,
          procedure: UNKNOWN_RULES[uQId].procedure
        });
      }
    }

    // Website-less guidance when Q1 is social or none
    var noWebsiteAdvice = '';
    if (answers.Q1 === 'social') {
      noWebsiteAdvice = 'ホームページをお持ちでない場合も、まずは現在お使いのInstagramや店舗紹介ページ、Googleマップに「営業時間・定休日・場所・主なメニュー・連絡方法」の基本案内を揃えることから始められます。ホームページ制作だけが唯一の解決策ではありません。複数の媒体の情報をひとつにまとめたくなった段階で制作をご検討ください。';
    } else if (answers.Q1 === 'none') {
      noWebsiteAdvice = 'ホームページやSNSをお持ちでない場合も、まずは無料で登録できるGoogleマップ（Googleビジネスプロフィール）やInstagramなどに「営業時間・定休日・住所・主なメニュー」の基本案内を揃えることから始められます。ホームページ制作だけが唯一の解決策ではありません。';
    }

    // Status message logic (incomplete vs all good vs unknown only vs has review items)
    var statusType = 'has_issues';
    var statusMessage = '';
    if (!isComplete) {
      statusType = 'incomplete';
      statusMessage = '未回答の設問があります。すべての設問に回答してから結果を確認してください。';
    } else if (reviewItems.length === 0 && unknownItems.length === 0) {
      statusType = 'all_good';
      statusMessage = '今回の回答では、優先して直す項目は見つかりませんでした。';
    } else if (reviewItems.length === 0 && unknownItems.length > 0) {
      statusType = 'unknown_only';
      statusMessage = 'まず現状を確認しましょう。今回の回答では明確な不備は選ばれていませんが、まだ確認していない項目があります。下の確認手順に沿って現在の案内状況を確かめてみてください。';
    }

    // Answered items summary with renumbered display numbers
    var answeredSummary = [];
    for (var s = 0; s < activeQuestionIds.length; s++) {
      var sQId = activeQuestionIds[s];
      var sQ = QUESTION_MAP[sQId];
      var sVal = answers[sQId] || '';
      answeredSummary.push({
        questionId: sQId,
        displayNumber: s + 1,
        questionText: sQ ? sQ.text : '',
        value: sVal,
        answerLabel: getOptionLabel(sQId, sVal)
      });
    }

    return {
      activeQuestionIds: activeQuestionIds,
      totalQuestions: activeQuestionIds.length,
      isComplete: isComplete,
      unansweredIds: unansweredIds,
      firstUnansweredId: unansweredIds[0] || null,
      answers: answers,
      goodItems: goodItems,
      reviewItems: reviewItems,
      primaryReviewItems: primaryReviewItems,
      remainingReviewItems: remainingReviewItems,
      unknownItems: unknownItems,
      noWebsiteAdvice: noWebsiteAdvice,
      statusType: statusType,
      statusMessage: statusMessage,
      answeredSummary: answeredSummary
    };
  }

  // Expose pure function for testing/verification
  window.evaluate = evaluate;
  window.evaluateShindan = evaluate;

  // State management
  var state = {
    version: STATE_VERSION,
    generation: 1,
    step: 'intro',
    currentQuestionId: 'Q1',
    answers: {}
  };

  var historyStack = [];
  var historyIndex = -1;
  var pendingBackCount = 0;

  function saveStateToStorage() {
    try {
      var payload = JSON.stringify({
        version: state.version,
        generation: state.generation,
        step: state.step,
        currentQuestionId: state.currentQuestionId,
        answers: state.answers
      });
      window.sessionStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      // Continue silently if sessionStorage is unavailable
    }
  }

  function clearStorage() {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }

  function loadStateFromStorage() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STATE_VERSION || typeof parsed.answers !== 'object') {
        return null;
      }
      var cleanAnswers = {};
      for (var i = 0; i < QUESTIONS.length; i++) {
        var q = QUESTIONS[i];
        var val = parsed.answers[q.id];
        if (val && getOptionLabel(q.id, val)) {
          cleanAnswers[q.id] = val;
        }
      }
      if (cleanAnswers.Q1 !== 'site') {
        delete cleanAnswers.Q2;
      }
      var gen =
        typeof parsed.generation === 'number' && parsed.generation >= 1
          ? Math.floor(parsed.generation)
          : 1;
      var restoredStep = parsed.step || 'intro';
      var restoredQuestionId = parsed.currentQuestionId || 'Q1';

      // 再読み込み時に「結果画面＋未完了の回答」だった場合は最初の未回答設問へ戻す
      if (restoredStep === 'result') {
        var missingQId = getFirstUnansweredQuestionId(cleanAnswers);
        if (missingQId) {
          restoredStep = 'question';
          restoredQuestionId = missingQId;
        }
      } else if (restoredStep === 'review' && !cleanAnswers.Q1) {
        restoredStep = 'intro';
        restoredQuestionId = 'Q1';
      }

      return {
        version: STATE_VERSION,
        generation: gen,
        step: restoredStep,
        currentQuestionId: restoredQuestionId,
        answers: cleanAnswers
      };
    } catch (e) {
      return null;
    }
  }

  // DOM References
  var stepIntro = document.getElementById('step-intro');
  var stepQuestion = document.getElementById('step-question');
  var stepReview = document.getElementById('step-review');
  var stepResult = document.getElementById('step-result');

  if (!stepIntro || !stepQuestion || !stepResult) {
    return;
  }

  var btnStart = document.getElementById('btn-start');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var questionError = document.getElementById('question-error');
  var progressText = document.getElementById('progress-text');
  var progressBar = document.getElementById('progress-bar');
  var progressFill = document.getElementById('progress-fill');
  var progressBranchNote = document.getElementById('progress-branch-note');

  var btnCopyResult = document.getElementById('btn-copy-result');
  var btnReviewAnswers = document.getElementById('btn-review-answers');
  var btnRestart = document.getElementById('btn-restart');
  var btnPrint = document.getElementById('btn-print');
  var btnRecalculate = document.getElementById('btn-recalculate');
  var btnCancelReview = document.getElementById('btn-cancel-review');

  var copyStatus = document.getElementById('copy-status');
  var copyFallbackBox = document.getElementById('copy-fallback-box');
  var copyFallbackTextarea = document.getElementById('copy-fallback-textarea');

  function syncRadiosFromAnswers() {
    for (var i = 0; i < QUESTIONS.length; i++) {
      var qId = QUESTIONS[i].id;
      var selectedVal = state.answers[qId] || '';
      var panel = document.getElementById('panel-' + qId);
      if (!panel) continue;
      var labels = panel.querySelectorAll('.shindan-option');
      for (var j = 0; j < labels.length; j++) {
        var label = labels[j];
        var val = label.getAttribute('data-value');
        var radio = label.querySelector('input[type="radio"]');
        var isSelected = selectedVal === val;
        if (radio) {
          radio.checked = isSelected;
        }
        if (isSelected) {
          label.classList.add('is-selected');
        } else {
          label.classList.remove('is-selected');
        }
      }
    }
  }

  function setAnswer(qId, value) {
    if (!QUESTION_MAP[qId] || !getOptionLabel(qId, value)) return;
    state.answers[qId] = value;
    // If Q1 is changed to anything other than 'site', discard Q2 immediately
    if (qId === 'Q1' && value !== 'site') {
      delete state.answers.Q2;
    }
    syncRadiosFromAnswers();
    hideQuestionError();
    updateProgressUI();
    saveStateToStorage();
  }

  function showQuestionError() {
    if (!questionError) return;
    questionError.textContent = '選択肢を選んでください。わからない場合も選べます';
    questionError.hidden = false;
  }

  function hideQuestionError() {
    if (!questionError) return;
    questionError.hidden = true;
  }

  function updateProgressUI() {
    var activeIds = getActiveQuestionIds(state.answers);
    var total = activeIds.length;
    var idx = activeIds.indexOf(state.currentQuestionId);
    if (idx === -1) idx = 0;
    var currentNum = idx + 1;

    // Update displayed question numbers across all active panels
    for (var i = 0; i < activeIds.length; i++) {
      var qId = activeIds[i];
      var numSpan = document.querySelector('[data-q-num="' + qId + '"]');
      if (numSpan) {
        numSpan.textContent = '質問' + (i + 1);
      }
    }

    if (progressText) {
      progressText.textContent = '質問' + currentNum + ' / 全' + total + '問';
    }
    if (progressBar) {
      progressBar.setAttribute('aria-valuemax', String(total));
      progressBar.setAttribute('aria-valuenow', String(currentNum));
    }
    if (progressFill) {
      var pct = Math.round((currentNum / total) * 10000) / 100;
      progressFill.style.width = pct + '%';
    }
    if (progressBranchNote) {
      var isSkipped = Boolean(state.answers.Q1 && state.answers.Q1 !== 'site');
      progressBranchNote.hidden = !isSkipped;
    }
    if (btnNext) {
      var isLast = idx === activeIds.length - 1;
      btnNext.textContent = isLast ? '結果を見る' : '次へ';
    }
  }

  function pushHistoryState(replace) {
    if (!replace && historyIndex >= 0 && historyStack[historyIndex]) {
      var curr = historyStack[historyIndex];
      if (
        curr.generation === state.generation &&
        curr.step === state.step &&
        (state.step !== 'question' || curr.currentQuestionId === state.currentQuestionId)
      ) {
        replace = true;
      }
    }

    if (replace) {
      if (historyIndex < 0) {
        historyIndex = 0;
      }
      historyStack[historyIndex] = {
        generation: state.generation,
        step: state.step,
        currentQuestionId: state.currentQuestionId
      };
    } else {
      historyIndex += 1;
      historyStack = historyStack.slice(0, historyIndex);
      historyStack.push({
        generation: state.generation,
        step: state.step,
        currentQuestionId: state.currentQuestionId
      });
    }

    if (!window.history || typeof window.history.pushState !== 'function') return;
    var histData = {
      shindan: true,
      generation: state.generation,
      historyIndex: historyIndex,
      step: state.step,
      currentQuestionId: state.currentQuestionId
    };
    try {
      if (replace) {
        window.history.replaceState(histData, '');
      } else {
        window.history.pushState(histData, '');
      }
    } catch (e) {
      // Ignore history errors in restricted environments
    }
  }

  function navigateBackOrReplace(targetStep, targetQuestionId) {
    var prevIdx = historyIndex - 1;
    if (prevIdx >= 0 && historyStack[prevIdx]) {
      var prevEntry = historyStack[prevIdx];
      var isSameGeneration = prevEntry.generation === state.generation;
      var matchesTarget =
        isSameGeneration &&
        prevEntry.step === targetStep &&
        (targetStep !== 'question' || prevEntry.currentQuestionId === targetQuestionId);

      if (matchesTarget && window.history && typeof window.history.back === 'function') {
        historyIndex = prevIdx;
        pendingBackCount += 1;
        showStep(targetStep, targetQuestionId, { fromPopState: true });
        try {
          window.history.back();
        } catch (e) {
          pendingBackCount = Math.max(0, pendingBackCount - 1);
        }
        return;
      }
    }
    showStep(targetStep, targetQuestionId, { replaceHistory: true });
  }

  function focusElement(el) {
    if (!el) return;
    try {
      el.focus();
    } catch (e) {
      // Ignore
    }
  }

  function showStep(stepName, questionId, options) {
    var opts = options || {};
    var targetStep = stepName || 'intro';
    var targetQuestionId = questionId || state.currentQuestionId || 'Q1';
    var redirected = false;

    // 10-A: 結果へ入る共通経路で、表示対象の全問に有効な回答があることを検証し、不足があれば最初の未回答の設問へ戻す
    if (targetStep === 'result') {
      var firstUnanswered = getFirstUnansweredQuestionId(state.answers);
      if (firstUnanswered) {
        targetStep = 'question';
        targetQuestionId = firstUnanswered;
        redirected = true;
      }
    } else if (targetStep === 'review') {
      if (!state.answers.Q1 || !getOptionLabel('Q1', state.answers.Q1)) {
        targetStep = 'intro';
        targetQuestionId = 'Q1';
        redirected = true;
      }
    }

    // 10-B & 10-A: 質問ステップでの有効性検証と、分岐変更で無効になった Q2 の履歴を開いた場合の戻り先（Q1）定義
    if (targetStep === 'question') {
      var activeIds = getActiveQuestionIds(state.answers);
      if (activeIds.indexOf(targetQuestionId) === -1) {
        targetQuestionId = 'Q1';
        redirected = true;
      }
      var targetIdx = activeIds.indexOf(targetQuestionId);
      for (var qIdx = 0; qIdx < targetIdx; qIdx++) {
        var priorQId = activeIds[qIdx];
        if (!state.answers[priorQId] || !getOptionLabel(priorQId, state.answers[priorQId])) {
          targetQuestionId = priorQId;
          redirected = true;
          break;
        }
      }
    }

    state.step = targetStep;
    state.currentQuestionId = targetQuestionId;

    stepIntro.hidden = state.step !== 'intro';
    stepQuestion.hidden = state.step !== 'question';
    if (stepReview) {
      stepReview.hidden = state.step !== 'review';
    }
    stepResult.hidden = state.step !== 'result';

    hideQuestionError();
    if (copyStatus) copyStatus.hidden = true;
    if (copyFallbackBox) copyFallbackBox.hidden = true;

    if (state.step === 'intro') {
      syncRadiosFromAnswers();
      if (!opts.skipFocus) {
        focusElement(document.getElementById('intro-heading'));
      }
    } else if (state.step === 'question') {
      syncRadiosFromAnswers();
      for (var i = 0; i < QUESTIONS.length; i++) {
        var qId = QUESTIONS[i].id;
        var panel = document.getElementById('panel-' + qId);
        if (panel) {
          panel.hidden = qId !== state.currentQuestionId;
        }
      }
      stepQuestion.setAttribute('data-current-question', state.currentQuestionId);
      updateProgressUI();
      if (!opts.skipFocus) {
        focusElement(document.getElementById('legend-' + state.currentQuestionId));
      }
    } else if (state.step === 'review') {
      renderReviewScreen();
      if (!opts.skipFocus) {
        focusElement(document.getElementById('review-heading'));
      }
    } else if (state.step === 'result') {
      renderResultScreen();
      if (!opts.skipFocus) {
        focusElement(document.getElementById('result-heading'));
      }
    }

    saveStateToStorage();
    if (!opts.fromPopState) {
      pushHistoryState(Boolean(opts.replaceHistory));
    } else if (opts.replaceHistory || redirected) {
      pushHistoryState(true);
    }
  }

  function createReviewCardElement(item) {
    var card = document.createElement('article');
    card.className = 'shindan-result-card';
    card.setAttribute('data-result-q', item.questionId);

    var h4 = document.createElement('h4');
    h4.textContent = item.title;
    card.appendChild(h4);

    var ansBadge = document.createElement('p');
    ansBadge.className = 'shindan-your-answer';
    ansBadge.textContent = 'あなたの回答：「' + item.answerLabel + '」';
    card.appendChild(ansBadge);

    var bodyP = document.createElement('p');
    bodyP.textContent = item.body;
    card.appendChild(bodyP);

    return card;
  }

  function createUnknownCardElement(item) {
    var card = document.createElement('article');
    card.className = 'shindan-result-card';
    card.setAttribute('data-unknown-q', item.questionId);

    var h4 = document.createElement('h4');
    h4.textContent = item.title;
    card.appendChild(h4);

    var ansBadge = document.createElement('p');
    ansBadge.className = 'shindan-your-answer';
    ansBadge.textContent = 'あなたの回答：「' + item.answerLabel + '」';
    card.appendChild(ansBadge);

    var procP = document.createElement('p');
    procP.textContent = item.procedure;
    card.appendChild(procP);

    return card;
  }

  function renderResultScreen() {
    var result = evaluate(state.answers);

    // Overall summary banner (all good or unknown only)
    var summaryBanner = document.getElementById('result-summary-banner');
    var summaryText = document.getElementById('result-summary-text');
    if (summaryBanner && summaryText) {
      if (result.statusMessage) {
        summaryText.textContent = result.statusMessage;
        summaryBanner.hidden = false;
      } else {
        summaryText.textContent = '';
        summaryBanner.hidden = true;
      }
    }

    // 1. Good items ("回答上、整っていること")
    var goodList = document.getElementById('result-good-list');
    var goodEmptyNote = document.getElementById('good-empty-note');
    if (goodList) {
      while (goodList.firstChild) {
        goodList.removeChild(goodList.firstChild);
      }
      if (result.goodItems.length === 0) {
        if (goodEmptyNote) goodEmptyNote.hidden = false;
      } else {
        if (goodEmptyNote) goodEmptyNote.hidden = true;
        for (var g = 0; g < result.goodItems.length; g++) {
          var li = document.createElement('li');
          var badge = document.createElement('span');
          badge.className = 'shindan-good-mark';
          badge.textContent = '確認済';
          var textSpan = document.createElement('span');
          textSpan.textContent = result.goodItems[g].text;
          li.appendChild(badge);
          li.appendChild(textSpan);
          goodList.appendChild(li);
        }
      }
    }

    // 2. Review items ("まず見直すこと")
    var noSiteAdviceBox = document.getElementById('result-no-site-advice');
    var noSiteAdviceText = document.getElementById('result-no-site-text');
    if (noSiteAdviceBox && noSiteAdviceText) {
      if (result.noWebsiteAdvice) {
        noSiteAdviceText.textContent = result.noWebsiteAdvice;
        noSiteAdviceBox.hidden = false;
      } else {
        noSiteAdviceText.textContent = '';
        noSiteAdviceBox.hidden = true;
      }
    }

    var reviewEmptyMsg = document.getElementById('review-empty-message');
    var primaryContainer = document.getElementById('result-review-primary');
    var remainingBlock = document.getElementById('result-review-remaining-block');
    var remainingContainer = document.getElementById('result-review-remaining');

    if (primaryContainer) {
      while (primaryContainer.firstChild) {
        primaryContainer.removeChild(primaryContainer.firstChild);
      }
    }
    if (remainingContainer) {
      while (remainingContainer.firstChild) {
        remainingContainer.removeChild(remainingContainer.firstChild);
      }
    }

    if (result.reviewItems.length === 0) {
      if (reviewEmptyMsg) {
        if (result.statusType === 'incomplete') {
          reviewEmptyMsg.textContent = '未回答の設問があります。すべての設問に回答してから結果を確認してください。';
        } else if (result.statusType === 'unknown_only') {
          reviewEmptyMsg.textContent =
            'まず現状を確認しましょう。今回の回答では明確な不備は選ばれていません。下の「まだ確認していないこと」の手順に沿って、現在の案内状況を確かめてみてください。';
        } else {
          reviewEmptyMsg.textContent = '今回の回答では、優先して直す項目は見つかりませんでした。';
        }
        reviewEmptyMsg.hidden = false;
      }
      if (remainingBlock) {
        remainingBlock.hidden = true;
      }
    } else {
      if (reviewEmptyMsg) {
        reviewEmptyMsg.textContent = '';
        reviewEmptyMsg.hidden = true;
      }
      for (var r = 0; r < result.primaryReviewItems.length; r++) {
        primaryContainer.appendChild(createReviewCardElement(result.primaryReviewItems[r]));
      }
      if (result.remainingReviewItems.length > 0 && remainingBlock && remainingContainer) {
        for (var rem = 0; rem < result.remainingReviewItems.length; rem++) {
          remainingContainer.appendChild(createReviewCardElement(result.remainingReviewItems[rem]));
        }
        remainingBlock.hidden = false;
      } else if (remainingBlock) {
        remainingBlock.hidden = true;
      }
    }

    // 3. Unknown items ("まだ確認していないこと")
    var unknownList = document.getElementById('result-unknown-list');
    var unknownEmptyNote = document.getElementById('unknown-empty-note');
    if (unknownList) {
      while (unknownList.firstChild) {
        unknownList.removeChild(unknownList.firstChild);
      }
      if (result.unknownItems.length === 0) {
        if (unknownEmptyNote) unknownEmptyNote.hidden = false;
      } else {
        if (unknownEmptyNote) unknownEmptyNote.hidden = true;
        for (var u = 0; u < result.unknownItems.length; u++) {
          unknownList.appendChild(createUnknownCardElement(result.unknownItems[u]));
        }
      }
    }

    // 4. Answered questions summary & individual edit links
    var summaryContainer = document.getElementById('result-answers-summary');
    if (summaryContainer) {
      while (summaryContainer.firstChild) {
        summaryContainer.removeChild(summaryContainer.firstChild);
      }
      for (var s = 0; s < result.answeredSummary.length; s++) {
        var rowData = result.answeredSummary[s];
        var row = document.createElement('div');
        row.className = 'shindan-answer-row';

        var mainDiv = document.createElement('div');
        mainDiv.className = 'shindan-answer-row-main';

        var qP = document.createElement('p');
        qP.className = 'shindan-answer-q';
        qP.textContent = '質問' + rowData.displayNumber + '：' + rowData.questionText;

        var aP = document.createElement('p');
        aP.className = 'shindan-answer-val';
        aP.textContent = '回答：' + (rowData.answerLabel || '未回答');

        mainDiv.appendChild(qP);
        mainDiv.appendChild(aP);

        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-secondary shindan-no-print';
        editBtn.setAttribute('data-edit-q', rowData.questionId);
        editBtn.textContent = '質問' + rowData.displayNumber + 'を修正する';
        editBtn.addEventListener(
          'click',
          (function (targetQId) {
            return function () {
              showStep('question', targetQId);
            };
          })(rowData.questionId)
        );

        row.appendChild(mainDiv);
        row.appendChild(editBtn);
        summaryContainer.appendChild(row);
      }
    }
  }

  function updateReviewQuestionSelection(qId) {
    var container = document.getElementById('review-questions-container');
    if (!container) return;
    var selectedVal = state.answers[qId] || '';
    var labels = container.querySelectorAll('label.shindan-option[data-review-q="' + qId + '"]');
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var val = label.getAttribute('data-review-value');
      var radio = label.querySelector('input[type="radio"]');
      var isSelected = selectedVal === val;
      if (radio) {
        radio.checked = isSelected;
      }
      if (isSelected) {
        label.classList.add('is-selected');
      } else {
        label.classList.remove('is-selected');
      }
    }
  }

  function renderReviewScreen(focusTarget) {
    var container = document.getElementById('review-questions-container');
    if (!container) return;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    var activeIds = getActiveQuestionIds(state.answers);
    for (var i = 0; i < activeIds.length; i++) {
      var qId = activeIds[i];
      var q = QUESTION_MAP[qId];
      if (!q) continue;

      var itemDiv = document.createElement('div');
      itemDiv.className = 'shindan-review-item';

      var fieldset = document.createElement('fieldset');
      fieldset.className = 'shindan-fieldset';

      var legend = document.createElement('legend');
      legend.className = 'shindan-legend';

      var numSpan = document.createElement('span');
      numSpan.className = 'shindan-q-num';
      numSpan.textContent = '質問' + (i + 1);
      legend.appendChild(numSpan);
      legend.appendChild(document.createTextNode(q.text));
      fieldset.appendChild(legend);

      if (q.supplement) {
        var supp = document.createElement('p');
        supp.className = 'shindan-supplement';
        supp.textContent = q.supplement;
        fieldset.appendChild(supp);
      }

      var optionsWrap = document.createElement('div');
      optionsWrap.className = 'shindan-options';

      for (var j = 0; j < q.options.length; j++) {
        var opt = q.options[j];
        var isChecked = state.answers[qId] === opt.value;

        var label = document.createElement('label');
        label.className = 'shindan-option' + (isChecked ? ' is-selected' : '');
        label.setAttribute('data-review-q', qId);
        label.setAttribute('data-review-value', opt.value);

        var mainSpan = document.createElement('span');
        mainSpan.className = 'shindan-option-main';

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.className = 'shindan-radio';
        radio.name = 'review-' + qId;
        radio.value = opt.value;
        radio.checked = isChecked;
        radio.setAttribute('data-review-q', qId);
        radio.setAttribute('data-review-value', opt.value);

        radio.addEventListener(
          'change',
          (function (questionId, optionValue) {
            return function () {
              var prevActiveKey = getActiveQuestionIds(state.answers).join(',');
              setAnswer(questionId, optionValue);
              var nextActiveKey = getActiveQuestionIds(state.answers).join(',');
              // 9-A: Q1 を site へ変更しても Q2='unknown' を自動設定しない（未選択で表示）
              // 9-B: 通常の回答変更では該当問の選択表示だけを更新し、Q1 分岐変更で再描画が必要な場合も操作位置へフォーカスを戻す
              if (prevActiveKey !== nextActiveKey) {
                renderReviewScreen({ questionId: questionId, value: optionValue });
              } else {
                updateReviewQuestionSelection(questionId);
              }
            };
          })(qId, opt.value)
        );

        var textSpan = document.createElement('span');
        textSpan.className = 'shindan-option-text';
        textSpan.textContent = opt.label;

        var badgeSpan = document.createElement('span');
        badgeSpan.className = 'shindan-option-badge';
        badgeSpan.setAttribute('aria-hidden', 'true');
        badgeSpan.textContent = '選択中';

        mainSpan.appendChild(radio);
        mainSpan.appendChild(textSpan);
        label.appendChild(mainSpan);
        label.appendChild(badgeSpan);
        optionsWrap.appendChild(label);
      }

      fieldset.appendChild(optionsWrap);
      itemDiv.appendChild(fieldset);
      container.appendChild(itemDiv);
    }

    if (focusTarget && focusTarget.questionId && focusTarget.value) {
      var targetRadio = container.querySelector(
        'input[name="review-' + focusTarget.questionId + '"][value="' + focusTarget.value + '"]'
      );
      focusElement(targetRadio);
    }
  }

  function buildCopyText() {
    var result = evaluate(state.answers);
    var lines = [];
    lines.push('【Studio Miraie 無料セルフチェック結果】');
    lines.push('※これは回答に基づくセルフチェックです。サイトの実測・検索順位の確認・専門家による個別調査は行っていません。');
    lines.push('');

    if (result.statusMessage) {
      lines.push(result.statusMessage);
      lines.push('');
    }

    lines.push('■ 回答上、整っていること');
    if (result.goodItems.length === 0) {
      lines.push('・確認済みの項目はまだありません');
    } else {
      for (var g = 0; g < result.goodItems.length; g++) {
        lines.push('・' + result.goodItems[g].text);
      }
    }
    lines.push('');

    lines.push('■ まず見直すこと');
    if (result.noWebsiteAdvice) {
      lines.push('※' + result.noWebsiteAdvice);
    }
    if (result.reviewItems.length === 0) {
      if (result.statusType === 'incomplete') {
        lines.push('・未回答の設問があります（すべての設問に回答してから結果を確認してください）');
      } else if (result.statusType === 'unknown_only') {
        lines.push('・まず現状を確認しましょう（明確な不備は選択されていません）');
      } else {
        lines.push('・今回の回答では、優先して直す項目は見つかりませんでした');
      }
    } else {
      for (var r = 0; r < result.reviewItems.length; r++) {
        var item = result.reviewItems[r];
        lines.push((r + 1) + '. ' + item.title);
        lines.push('   あなたの回答：「' + item.answerLabel + '」');
        lines.push('   ' + item.body);
      }
    }
    lines.push('');

    lines.push('■ まだ確認していないこと');
    if (result.unknownItems.length === 0) {
      lines.push('・なし');
    } else {
      for (var u = 0; u < result.unknownItems.length; u++) {
        var uItem = result.unknownItems[u];
        lines.push('・' + uItem.title + '（あなたの回答：「' + uItem.answerLabel + '」）');
        lines.push('  ' + uItem.procedure);
      }
    }
    lines.push('');

    lines.push('■ あなたの回答一覧');
    for (var s = 0; s < result.answeredSummary.length; s++) {
      var ans = result.answeredSummary[s];
      lines.push('質問' + ans.displayNumber + '：' + ans.questionText + ' → ' + (ans.answerLabel || '未回答'));
    }

    return lines.join('\n');
  }

  // Event Listeners
  if (btnStart) {
    btnStart.addEventListener('click', function () {
      showStep('question', 'Q1');
    });
  }

  // Option selection listeners on question panels
  var optionInputs = stepQuestion.querySelectorAll('input.shindan-radio');
  for (var idx = 0; idx < optionInputs.length; idx++) {
    optionInputs[idx].addEventListener('change', function (e) {
      var target = e.target;
      var qId = target.getAttribute('data-q') || target.name;
      var val = target.getAttribute('data-value') || target.value;
      setAnswer(qId, val);
    });
  }

  var optionLabels = stepQuestion.querySelectorAll('label.shindan-option');
  for (var lIdx = 0; lIdx < optionLabels.length; lIdx++) {
    optionLabels[lIdx].addEventListener('click', function (e) {
      var label = e.currentTarget;
      var qId = label.getAttribute('data-q');
      var val = label.getAttribute('data-value');
      if (qId && val) {
        setAnswer(qId, val);
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', function () {
      var currentQId = state.currentQuestionId;
      // Check DOM radio in case it was set directly without firing change
      var checkedRadio = stepQuestion.querySelector('input[name="' + currentQId + '"]:checked');
      if (checkedRadio && !state.answers[currentQId]) {
        setAnswer(currentQId, checkedRadio.value);
      }

      if (!state.answers[currentQId]) {
        showQuestionError();
        return;
      }

      var activeIds = getActiveQuestionIds(state.answers);
      var currentIdx = activeIds.indexOf(currentQId);
      if (currentIdx === -1) {
        currentIdx = 0;
      }

      if (currentIdx < activeIds.length - 1) {
        showStep('question', activeIds[currentIdx + 1]);
      } else {
        showStep('result');
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      var activeIds = getActiveQuestionIds(state.answers);
      var currentIdx = activeIds.indexOf(state.currentQuestionId);
      if (currentIdx > 0) {
        navigateBackOrReplace('question', activeIds[currentIdx - 1]);
      } else {
        navigateBackOrReplace('intro', 'Q1');
      }
    });
  }

  if (btnReviewAnswers) {
    btnReviewAnswers.addEventListener('click', function () {
      showStep('review');
    });
  }

  if (btnRecalculate) {
    btnRecalculate.addEventListener('click', function () {
      // Ensure all active questions have an answer; if Q2 became active without answer, go to Q2
      var missingQId = getFirstUnansweredQuestionId(state.answers);
      if (missingQId) {
        showStep('question', missingQId);
        return;
      }
      showStep('result');
    });
  }

  if (btnCancelReview) {
    btnCancelReview.addEventListener('click', function () {
      var missingQId = getFirstUnansweredQuestionId(state.answers);
      if (missingQId) {
        showStep('question', missingQId);
        return;
      }
      navigateBackOrReplace('result', state.currentQuestionId);
    });
  }

  if (btnRestart) {
    btnRestart.addEventListener('click', function () {
      state.generation += 1;
      state.answers = {};
      state.currentQuestionId = 'Q1';
      clearStorage();
      syncRadiosFromAnswers();
      showStep('intro', 'Q1');
    });
  }

  if (btnCopyResult) {
    btnCopyResult.addEventListener('click', function () {
      var text = buildCopyText();
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).then(
          function () {
            if (copyStatus) {
              copyStatus.textContent = '診断結果をクリップボードにコピーしました。相談時のメモとして貼り付けてご利用いただけます。';
              copyStatus.hidden = false;
            }
            if (copyFallbackBox) {
              copyFallbackBox.hidden = true;
            }
          },
          function () {
            showCopyFallback(text);
          }
        );
      } else {
        showCopyFallback(text);
      }
    });
  }

  function showCopyFallback(text) {
    if (copyStatus) {
      copyStatus.textContent = '自動コピーできなかったため、下のテキスト欄から選択してコピーしてください。';
      copyStatus.hidden = false;
    }
    if (copyFallbackBox && copyFallbackTextarea) {
      copyFallbackTextarea.value = text;
      copyFallbackBox.hidden = false;
      copyFallbackTextarea.focus();
      copyFallbackTextarea.select();
    }
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', function () {
      if (typeof window.print === 'function') {
        window.print();
      }
    });
  }

  // Browser back/forward restoration via History API
  window.addEventListener('popstate', function (e) {
    var hist = e.state;
    if (pendingBackCount > 0) {
      pendingBackCount -= 1;
      if (
        hist &&
        hist.shindan &&
        hist.generation === state.generation &&
        hist.step === state.step &&
        (state.step !== 'question' || hist.currentQuestionId === state.currentQuestionId)
      ) {
        if (typeof hist.historyIndex === 'number') {
          historyIndex = hist.historyIndex;
        }
        return;
      }
    }

    if (hist && hist.shindan) {
      // 10-A: リセット前の古いセッション世代の履歴エントリは無効化する
      if (typeof hist.generation !== 'number' || hist.generation !== state.generation) {
        showStep('intro', 'Q1', {
          fromPopState: true,
          replaceHistory: true
        });
        return;
      }
      if (typeof hist.historyIndex === 'number') {
        historyIndex = hist.historyIndex;
      }
      showStep(hist.step || 'intro', hist.currentQuestionId || 'Q1', {
        fromPopState: true
      });
    } else {
      showStep('intro', 'Q1', { fromPopState: true, replaceHistory: true });
    }
  });

  // Initialize from sessionStorage if available, otherwise start at intro
  var saved = loadStateFromStorage();
  if (
    window.history &&
    window.history.state &&
    window.history.state.shindan &&
    typeof window.history.state.generation === 'number'
  ) {
    state.generation = Math.max(state.generation, window.history.state.generation);
  }
  if (saved) {
    state.generation = Math.max(state.generation, saved.generation || 1);
    state.answers = saved.answers;
    state.currentQuestionId = saved.currentQuestionId;
    state.step = saved.step;
    showStep(state.step, state.currentQuestionId, {
      replaceHistory: true,
      skipFocus: true
    });
  } else {
    showStep('intro', 'Q1', {
      replaceHistory: true,
      skipFocus: true
    });
  }
})();
