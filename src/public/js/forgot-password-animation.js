var emailLabel = document.querySelector("#forgotEmailLabel"),
  email = document.querySelector("#forgotEmail"),
  mySVG = document.querySelector(".svgContainer"),
  twoFingers = document.querySelector(".twoFingers"),
  armL = document.querySelector(".armL"),
  armR = document.querySelector(".armR"),
  eyeL = document.querySelector(".eyeL"),
  eyeR = document.querySelector(".eyeR"),
  nose = document.querySelector(".nose"),
  mouth = document.querySelector(".mouth"),
  mouthBG = document.querySelector(".mouthBG"),
  mouthSmallBG = document.querySelector(".mouthSmallBG"),
  mouthMediumBG = document.querySelector(".mouthMediumBG"),
  mouthLargeBG = document.querySelector(".mouthLargeBG"),
  mouthMaskPath = document.querySelector("#mouthMaskPathSmall"),
  mouthOutline = document.querySelector(".mouthOutline"),
  tooth = document.querySelector(".tooth"),
  tongue = document.querySelector(".tongue"),
  tongueGroup = document.querySelector(".tongue").parentElement,
  chin = document.querySelector(".chin"),
  face = document.querySelector(".face"),
  eyebrow = document.querySelector(".eyebrow"),
  outerEarL = document.querySelector(".earL .outerEar"),
  outerEarR = document.querySelector(".earR .outerEar"),
  earHairL = document.querySelector(".earL .earHair"),
  earHairR = document.querySelector(".earR .earHair"),
  hair = document.querySelector(".hair"),
  bodyBG = document.querySelector(".bodyBGnormal"),
  bodyBGchanged = document.querySelector(".bodyBGchanged");

var activeElement,
  curEmailIndex,
  screenCenter,
  svgCoords,
  emailCoords,
  emailScrollMax,
  chinMin = 0.5,
  dFromC,
  mouthStatus = "small",
  blinking,
  eyeScale = 1,
  eyesCovered = false;

var eyeLCoords,
  eyeRCoords,
  noseCoords,
  mouthCoords,
  eyeLAngle,
  eyeLX,
  eyeLY,
  eyeRAngle,
  eyeRX,
  eyeRY,
  noseAngle,
  noseX,
  noseY,
  mouthAngle,
  mouthX,
  mouthY,
  mouthR,
  chinX,
  chinY,
  chinS,
  faceX,
  faceY,
  faceSkew,
  eyebrowSkew,
  outerEarX,
  outerEarY,
  hairX,
  hairS;

const mouthClipGroup = document.querySelector("#mouthClipGroup");
const mouthSmallList = Array.from(document.querySelectorAll(".mouthSmallBG"));
const mouthMediumList = Array.from(document.querySelectorAll(".mouthMediumBG"));
const mouthLargeList = Array.from(document.querySelectorAll(".mouthLargeBG"));
const mouthOutlineList = Array.from(document.querySelectorAll(".mouthOutline"));
const mouthBGList = Array.from(document.querySelectorAll(".mouthBG"));

function calculateFaceMove(e) {
  var carPos = email.selectionEnd,
    div = document.createElement("div"),
    span = document.createElement("span"),
    copyStyle = getComputedStyle(email),
    caretCoords = {};
  if (carPos == null || carPos == 0) {
    carPos = email.value.length;
  }
  [].forEach.call(copyStyle, function (prop) {
    div.style[prop] = copyStyle[prop];
  });
  div.style.position = "absolute";
  document.body.appendChild(div);
  div.textContent = email.value.substr(0, carPos);
  span.textContent = email.value.substr(carPos) || ".";
  div.appendChild(span);

  if (email.scrollWidth <= emailScrollMax) {
    caretCoords = getPosition(span);
    dFromC = screenCenter - (caretCoords.x + emailCoords.x);
    eyeLAngle = getAngle(
      eyeLCoords.x,
      eyeLCoords.y,
      emailCoords.x + caretCoords.x,
      emailCoords.y + 25
    );
    eyeRAngle = getAngle(
      eyeRCoords.x,
      eyeRCoords.y,
      emailCoords.x + caretCoords.x,
      emailCoords.y + 25
    );
    noseAngle = getAngle(
      noseCoords.x,
      noseCoords.y,
      emailCoords.x + caretCoords.x,
      emailCoords.y + 25
    );
    mouthAngle = getAngle(
      mouthCoords.x,
      mouthCoords.y,
      emailCoords.x + caretCoords.x,
      emailCoords.y + 25
    );
  } else {
    eyeLAngle = getAngle(
      eyeLCoords.x,
      eyeLCoords.y,
      emailCoords.x + emailScrollMax,
      emailCoords.y + 25
    );
    eyeRAngle = getAngle(
      eyeRCoords.x,
      eyeRCoords.y,
      emailCoords.x + emailScrollMax,
      emailCoords.y + 25
    );
    noseAngle = getAngle(
      noseCoords.x,
      noseCoords.y,
      emailCoords.x + emailScrollMax,
      emailCoords.y + 25
    );
    mouthAngle = getAngle(
      mouthCoords.x,
      mouthCoords.y,
      emailCoords.x + emailScrollMax,
      emailCoords.y + 25
    );
  }

  eyeLX = Math.cos(eyeLAngle) * 20;
  eyeLY = Math.sin(eyeLAngle) * 10;
  eyeRX = Math.cos(eyeRAngle) * 20;
  eyeRY = Math.sin(eyeRAngle) * 10;
  noseX = Math.cos(noseAngle) * 23;
  noseY = Math.sin(noseAngle) * 10;
  mouthX = Math.cos(mouthAngle) * 23;
  mouthY = Math.sin(mouthAngle) * 10;
  mouthR = Math.cos(mouthAngle) * 6;
  chinX = mouthX * 0.8;
  chinY = mouthY * 0.5;
  chinS = 1 - (dFromC * 0.15) / 100;
  if (chinS > 1) {
    chinS = 1 - (chinS - 1);
    if (chinS < chinMin) {
      chinS = chinMin;
    }
  }
  faceX = mouthX * 0.3;
  faceY = mouthY * 0.4;
  faceSkew = Math.cos(mouthAngle) * 5;
  eyebrowSkew = Math.cos(mouthAngle) * 25;
  outerEarX = Math.cos(mouthAngle) * 4;
  outerEarY = Math.cos(mouthAngle) * 5;
  hairX = Math.cos(mouthAngle) * 6;
  hairS = 1.2;

  TweenMax.to(eyeL, 1, { x: -eyeLX, y: -eyeLY, ease: Expo.easeOut });
  TweenMax.to(eyeR, 1, { x: -eyeRX, y: -eyeRY, ease: Expo.easeOut });
  TweenMax.to(nose, 1, {
    x: -noseX,
    y: -noseY,
    rotation: mouthR,
    transformOrigin: "center center",
    ease: Expo.easeOut,
  });
  TweenMax.to(mouth, 1, {
    x: -mouthX,
    y: -mouthY,
    rotation: mouthR,
    transformOrigin: "center center",
    ease: Expo.easeOut,
  });
  TweenMax.to(chin, 1, {
    x: -chinX,
    y: -chinY,
    scaleY: chinS,
    ease: Expo.easeOut,
  });
  TweenMax.to(face, 1, {
    x: -faceX,
    y: -faceY,
    skewX: -faceSkew,
    transformOrigin: "center top",
    ease: Expo.easeOut,
  });
  TweenMax.to(eyebrow, 1, {
    x: -faceX,
    y: -faceY,
    skewX: -eyebrowSkew,
    transformOrigin: "center top",
    ease: Expo.easeOut,
  });
  TweenMax.to(outerEarL, 1, {
    x: outerEarX,
    y: -outerEarY,
    ease: Expo.easeOut,
  });
  TweenMax.to(outerEarR, 1, { x: outerEarX, y: outerEarY, ease: Expo.easeOut });
  TweenMax.to(earHairL, 1, {
    x: -outerEarX,
    y: -outerEarY,
    ease: Expo.easeOut,
  });
  TweenMax.to(earHairR, 1, { x: -outerEarX, y: outerEarY, ease: Expo.easeOut });
  TweenMax.to(hair, 1, {
    x: hairX,
    scaleY: hairS,
    transformOrigin: "center bottom",
    ease: Expo.easeOut,
  });

  document.body.removeChild(div);
}

function onEmailInput(e) {
  console.log('onEmailInput called, value:', email.value);
  calculateFaceMove(e);
  var value = email.value;
  curEmailIndex = value.length;

  if (curEmailIndex === 0) {
    mouthStatus = "small";
    showMouth(mouthSmallList, "Small");
    TweenMax.to(tooth, 1, { x: 0, y: 0, ease: Expo.easeOut });
    TweenMax.to(tongue, 1, { y: 0, ease: Expo.easeOut });
    TweenMax.to([eyeL, eyeR], 1, { scaleX: 1, scaleY: 1, ease: Expo.easeOut });
    eyeScale = 1;
  } else if (value.includes("@")) {
    mouthStatus = "large";
    showMouth(mouthLargeList, "Large");
    TweenMax.to(tooth, 1, { x: 3, y: -2, ease: Expo.easeOut });
    TweenMax.to(tongue, 1, { y: 2, ease: Expo.easeOut });
    TweenMax.to([eyeL, eyeR], 1, {
      scaleX: 0.65,
      scaleY: 0.65,
      ease: Expo.easeOut,
      transformOrigin: "center center",
    });
    eyeScale = 0.65;
  } else {
    mouthStatus = "medium";
    showMouth(mouthMediumList, "Medium");
    TweenMax.to(tooth, 1, { x: 0, y: 0, ease: Expo.easeOut });
    TweenMax.to(tongue, 1, { x: 0, y: 1, ease: Expo.easeOut });
    TweenMax.to([eyeL, eyeR], 1, {
      scaleX: 0.85,
      scaleY: 0.85,
      ease: Expo.easeOut,
    });
    eyeScale = 0.85;
  }
}

function onEmailFocus(e) {
  activeElement = "email";
  e.target.parentElement.classList.add("focusWithText");
  // Only trigger animation if user is actually typing, not when page loads with value
  if (e.target.value === '') {
    onEmailInput();
  }
}

function onEmailBlur(e) {
  activeElement = null;
  setTimeout(function () {
    if (activeElement == "email") {
    } else {
      if (e.target.value == "") {
        e.target.parentElement.classList.remove("focusWithText");
      }
      resetFace();
    }
  }, 100);
}

function onEmailLabelClick(e) {
  activeElement = "email";
}

function resetFace() {
  TweenMax.to([eyeL, eyeR], 1, { x: 0, y: 0, ease: Expo.easeOut });
  TweenMax.to(nose, 1, {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    ease: Expo.easeOut,
  });
  TweenMax.to(mouth, 1, { x: 0, y: 0, rotation: 0, ease: Expo.easeOut });
  TweenMax.to(chin, 1, { x: 0, y: 0, scaleY: 1, ease: Expo.easeOut });
  TweenMax.to([face, eyebrow], 1, { x: 0, y: 0, skewX: 0, ease: Expo.easeOut });
  TweenMax.to([outerEarL, outerEarR, earHairL, earHairR, hair], 1, {
    x: 0,
    y: 0,
    scaleY: 1,
    ease: Expo.easeOut,
  });
}

function startBlinking(delay) {
  if (delay) {
    delay = getRandomInt(delay);
  } else {
    delay = 1;
  }
  blinking = TweenMax.to([eyeL, eyeR], 0.1, {
    delay: delay,
    scaleY: 0,
    yoyo: true,
    repeat: 1,
    transformOrigin: "center center",
    onComplete: function () {
      startBlinking(12);
    },
  });
}

function stopBlinking() {
  blinking.kill();
  blinking = null;
  TweenMax.set([eyeL, eyeR], { scaleY: eyeScale });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getAngle(x1, y1, x2, y2) {
  var angle = Math.atan2(y1 - y2, x1 - x2);
  return angle;
}

function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += el.offsetLeft - xScroll + el.clientLeft;
      yPos += el.offsetTop - yScroll + el.clientTop;
    } else {
      xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
      yPos += el.offsetTop - el.scrollTop + el.clientTop;
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos,
  };
}

function changeMouthClipPath(mouthType) {
  const clipPathUrl = `url(#mouthMask${mouthType})`;
  if (mouthClipGroup) mouthClipGroup.setAttribute("clip-path", clipPathUrl);
  tongueGroup.setAttribute("clip-path", clipPathUrl);
  tooth.setAttribute("clip-path", clipPathUrl);
}

function showMouth(targetList, clipType) {
  [mouthSmallList, mouthMediumList, mouthLargeList].forEach((list) =>
    list.forEach((el) => (el.style.display = "none"))
  );

  if (typeof mouthBGList !== "undefined") {
    mouthBGList.forEach((el) => (el.style.display = "none"));
  }

  targetList.forEach((el) => (el.style.display = "block"));

  const showOutline = targetList !== mouthLargeList;
  mouthOutlineList.forEach(
    (el) => (el.style.display = showOutline ? "block" : "none")
  );

  changeMouthClipPath(clipType);
}

function initForgotPasswordForm() {
  [mouthSmallList, mouthMediumList, mouthLargeList, mouthOutlineList].forEach(
    (list) => list.forEach((el) => (el.style.display = "none"))
  );
  mouthSmallList.forEach((el) => (el.style.display = "block"));
  mouthOutlineList.forEach((el) => (el.style.display = "block"));
  changeMouthClipPath("Small");

  svgCoords = getPosition(mySVG);
  emailCoords = getPosition(email);
  screenCenter = svgCoords.x + mySVG.offsetWidth / 2;
  eyeLCoords = { x: svgCoords.x + 84, y: svgCoords.y + 76 };
  eyeRCoords = { x: svgCoords.x + 113, y: svgCoords.y + 76 };
  noseCoords = { x: svgCoords.x + 97, y: svgCoords.y + 81 };
  mouthCoords = { x: svgCoords.x + 100, y: svgCoords.y + 100 };

  email.addEventListener("focus", onEmailFocus);
  email.addEventListener("blur", onEmailBlur);
  email.addEventListener("input", onEmailInput);
  emailLabel.addEventListener("click", onEmailLabelClick);

  TweenMax.set(armL, {
    x: -93,
    y: 220,
    rotation: 105,
    transformOrigin: "top left",
  });
  TweenMax.set(armR, {
    x: -93,
    y: 220,
    rotation: -105,
    transformOrigin: "top right",
  });

  TweenMax.set(mouth, { transformOrigin: "center center" });

  startBlinking(5);

  emailScrollMax = email.scrollWidth;

  if (mouthBG) mouthBG.style.display = "none";
  mouthMediumBG.style.display = "none";
  mouthLargeBG.style.display = "none";
  mouthSmallBG.style.display = "block";
  mouthOutline.style.display = "block";
  changeMouthClipPath("Small");
}

initForgotPasswordForm();
