
// 문서 요소들
var dialogBox = document.getElementById('dialog-box');
var buttonStart = document.getElementById('button-start');
var title = document.getElementById('title');
var gameScene = document.getElementById('game-scene');
var soundToggle = document.getElementById('sound-toggle');
var backgroundAudio = document.getElementById('background-audio');

// 게임 상태
var dataNo = 0; // 현재 재생 중인 동화 시나리오 번호
var jsonData = []; // 현재 화면에서 재생해야 하는 동화 시나리오 목록

// 배경음악 on/off 토글 버튼 클릭 동작
soundToggle.addEventListener('click', function () {
  if (this.classList.contains('sound-on')) { // 배경 음악 재생 중일 때
    this.classList.remove('sound-on');
    this.classList.add('sound-off');
    backgroundAudio.pause();
  } else { // 배경 음악이 정지 상태일 때
    this.classList.remove('sound-off');
    this.classList.add('sound-on');
    backgroundAudio.play();
  }
});

// 게임 시작
init();

/**
 * 게임을 초기화합니다.
 */
function init() {

  // 다이얼로그 박스를 보이게 만듭니다.
  dialogBox.style.display = 'block';

  // 시작 버튼 클릭 시 게임을 시작합니다.
  buttonStart.addEventListener('click', function () {
    startGame();
  });
}

/**
 * 게임을 시작합니다.
 */
function startGame() {
  dialogBox.style.display = 'none';
  title.style.display = 'block';
  loadData('scenes/scene_01.html');
}

/**
 * 게임 신 데이터를 로드합니다.
 * @param partName {string}
 */
function loadData(partName) {
  fetch(partName).then(response => {
    if (!response) return;
    response.text().then(htmlString => {
      const htmlDOM = new DOMParser().parseFromString(htmlString, 'text/html');
      gameScene.innerHTML = htmlString;
      const jsonString = htmlDOM.getElementById('json-data').textContent;
      jsonData = JSON.parse(jsonString);
      dataNo = 0;
      parseGameDate(); //
    });
  });
}

/**
 * 게임 시나리오 데이터를 한 단계씩 꺼내면서 처리합니다.
 */
function parseGameDate() {
  const len = jsonData.length;
  for (let i = dataNo ; i < jsonData.length ; i++) {
    dataNo++;
    const result = setGameData(jsonData[i]);
    if (result === -1) console.error(`[${i}] error occurred : `, jsonData[i]);
    else if (result === 0) return;
  }
}

/**
 * 현재 처리할 시나리오 데이터를 파싱하여 내용에 맞는 화면 업데이트를 수행합니다.
 * @param data {{
 *    id: 'display' | 'hidden' | 'addClass' | 'removeClass' | 'button' | 'wait' | 'nextScene',
 *    class1: string,
 *    class2: string,
 *    top?: number,
 *    left?: number,
 *    margintop?: number,
 *    time?: number,
 * }}
 */
function setGameData(data) {
  //
  const class1Elements = document.querySelectorAll(`.${data.class1}`);
  const isClass = class1Elements.length > 0;
  // const isClass = $('.hidden-data').hasClass(data.class1);

  // 전달받은 데이터의 id 값 종류에 따라 다른 처리를 수행합니다.
  switch (data.id) {

    // display :
    case "display":
      if (!isClass) return -1;
      class1Elements.forEach(element => {
        element.style.display = 'block';
        element.style.top = `${data.top || 0}px`;
        element.style.left = `${data.left || 0}px`;
        element.style.marginTop = `${data.margintop || 0}px`;
      });
      return 1;

    // addClass :
    case "addClass":
      if (!isClass) return -1;
      class1Elements.forEach(element => {
        element.classList.add(data.class2);
      });
      return 1;

    // removeClass :
    case "removeClass":
      if (!isClass) return -1;
      class1Elements.forEach(element => {
        element.classList.remove(data.class2);
      });
      return 1;

    // hidden :
    case "hidden":
      if (!isClass) return -1;
      class1Elements.forEach(element => {
        element.style.display = 'none';
      });
      return 1;

    // button :
    case "button":
      if (!isClass) return -1;
      class1Elements.forEach(element => {
        element.style.display = 'block';
        element.style.top = `${data.top || 0}px`;
        element.style.left = `${data.left || 0}px`;
        element.addEventListener('click', nextText);
      });
      return 0;

    // nextScene :
    case "nextScene":
      if (!isClass) return -1;
      class1Elements.forEach(element => {
        element.style.display = 'block';
        element.style.top = `${data.top || 0}px`;
        element.style.left = `${data.left || 0}px`;
        element.addEventListener('click', changeScene);
      });
      return 1;

    // wait :
    case "wait":
      setTimeout(parseGameDate, data.time); //
      return 0;
  }

  // 허용되지 않은 id 종류가 들어온 경우, 오류로 판단
  return 1;
}

/**
 * 다음 게임 신의 정보를 가져옵니다.
 */
function changeScene() {
  const strHref = $(this).data('href'); // fixme: jQuery 사용하지 않고 해보기
  loadData(`scenes/${strHref}`);
}

/**
 * 다음 문장을 보여줍니다.
 */
function nextText() {
  $(this).css('display', 'none'); // fixme: jQuery 사용하지 않고 해보기
  $(this).unbind('click', nextText); // fixme: jQuery 사용하지 않고 해보기
  parseGameDate();
}
