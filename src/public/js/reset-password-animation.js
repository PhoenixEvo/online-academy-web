var codeLabel = document.querySelector("#resetCodeLabel"),
  code = document.querySelector("#resetCode"),
  passwordLabel = document.querySelector("#resetPasswordLabel"),
  password = document.querySelector("#resetPassword"),
  confirmPasswordLabel = document.querySelector("#confirmPasswordLabel"),
  confirmPassword = document.querySelector("#confirmPassword"),
  showPasswordCheck = document.querySelector("#showPasswordCheck"),
  showPasswordToggle = document.querySelector("#showPasswordToggle"),
  showConfirmPasswordCheck = document.querySelector("#showConfirmPasswordCheck"),
  showConfirmPasswordToggle = document.querySelector("#showConfirmPasswordToggle"),
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
  curCodeIndex,
  screenCenter,
  svgCoords,
  codeCoords,
  codeScrollMax,
  chinMin = 0.5,
  dFromC,
  mouthStatus = "small",
  blinking,
  eyeScale = 1,
  eyesCovered = false,
  showPasswordClicked = false,
  showConfirmPasswordClicked = false;

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
  var carPos = code.selectionEnd,
    div = document.createElement("div"),
    span = document.createElement("span"),
    copyStyle = getComputedStyle(code),
    caretCoords = {};
  if (carPos == null || carPos == 0) {
    carPos = code.value.length;
  }
  [].forEach.call(copyStyle, function (prop) {
    div.style[prop] = copyStyle[prop];
  });
  div.style.position = "absolute";
  document.body.appendChild(div);
  div.textContent = code.value.substr(0, carPos);
  span.textContent = code.value.substr(carPos) || ".";
  div.appendChild(span);

  if (code.scrollWidth <= codeScrollMax) {
    caretCoords = getPosition(span);
    dFromC = screenCenter - (caretCoords.x + codeCoords.x);
    eyeLAngle = getAngle(
      eyeLCoords.x,
      eyeLCoords.y,
      codeCoords.x + caretCoords.x,
      codeCoords.y + 25
    );
    eyeRAngle = getAngle(
      eyeRCoords.x,
      eyeRCoords.y,
      codeCoords.x + caretCoords.x,
      codeCoords.y + 25
    );
    noseAngle = getAngle(
      noseCoords.x,
      noseCoords.y,
      codeCoords.x + caretCoords.x,
      codeCoords.y + 25
    );
    mouthAngle = getAngle(
      mouthCoords.x,
      mouthCoords.y,
      codeCoords.x + caretCoords.x,
      codeCoords.y + 25
    );
  } else {
    eyeLAngle = getAngle(
      eyeLCoords.x,
      eyeLCoords.y,
      codeCoords.x + codeScrollMax,
      codeCoords.y + 25
    );
    eyeRAngle = getAngle(
      eyeRCoords.x,
      eyeRCoords.y,
      codeCoords.x + codeScrollMax,
      codeCoords.y + 25
    );
    noseAngle = getAngle(
      noseCoords.x,
      noseCoords.y,
      codeCoords.x + codeScrollMax,
      codeCoords.y + 25
    );
    mouthAngle = getAngle(
      mouthCoords.x,
      mouthCoords.y,
      codeCoords.x + codeScrollMax,
      codeCoords.y + 25
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

function onCodeInput(e) {
  calculateFaceMove(e);
  var value = code.value;
  curCodeIndex = value.length;

  if (curCodeIndex === 0) {
    mouthStatus = "small";
    showMouth(mouthSmallList, "Small");
    TweenMax.to(tooth, 1, { x: 0, y: 0, ease: Expo.easeOut });
    TweenMax.to(tongue, 1, { y: 0, ease: Expo.easeOut });
    TweenMax.to([eyeL, eyeR], 1, { scaleX: 1, scaleY: 1, ease: Expo.easeOut });
    eyeScale = 1;
  } else if (value.length >= 6) {
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

function onCodeFocus(e) {
  activeElement = "code";
  e.target.parentElement.classList.add("focusWithText");
  onCodeInput();
}

function onCodeBlur(e) {
  activeElement = null;
  setTimeout(function () {
    if (activeElement == "code") {
    } else {
      if (e.target.value == "") {
        e.target.parentElement.classList.remove("focusWithText");
      }
      resetFace();
    }
  }, 100);
}

function onCodeLabelClick(e) {
  activeElement = "code";
}

function onPasswordFocus(e) {
  activeElement = "password";
  if (!eyesCovered) {
    coverEyes();
  }
}

function onPasswordBlur(e) {
  activeElement = null;
  setTimeout(function () {
    if (activeElement == "toggle" || activeElement == "password") {
    } else {
      uncoverEyes();
    }
  }, 100);
}

function onPasswordToggleFocus(e) {
  activeElement = "toggle";
  if (!eyesCovered) {
    coverEyes();
  }
}

function onPasswordToggleBlur(e) {
  activeElement = null;
  if (!showPasswordClicked) {
    setTimeout(function () {
      if (activeElement == "password" || activeElement == "toggle") {
      } else {
        uncoverEyes();
      }
    }, 100);
  }
}

function onPasswordToggleMouseDown(e) {
  showPasswordClicked = true;
}

function onPasswordToggleMouseUp(e) {
  showPasswordClicked = false;
}

function onPasswordToggleChange(e) {
  setTimeout(function () {
    if (e.target.checked) {
      password.type = "text";
      confirmPassword.type = "text";
      spreadFingers();
    } else {
      password.type = "password";
      confirmPassword.type = "password";
      closeFingers();
    }
  }, 100);
}

function onPasswordToggleClick(e) {
  e.target.focus();
}

function onConfirmPasswordFocus(e) {
  activeElement = "confirmPassword";
  if (!eyesCovered) {
    coverEyes();
  }
}

function onConfirmPasswordBlur(e) {
  activeElement = null;
  setTimeout(function () {
    if (activeElement == "confirmToggle" || activeElement == "confirmPassword") {
    } else {
      uncoverEyes();
    }
  }, 100);
}

function onConfirmPasswordToggleFocus(e) {
  activeElement = "confirmToggle";
  if (!eyesCovered) {
    coverEyes();
  }
}

function onConfirmPasswordToggleBlur(e) {
  activeElement = null;
  if (!showConfirmPasswordClicked) {
    setTimeout(function () {
      if (activeElement == "confirmPassword" || activeElement == "confirmToggle") {
      } else {
        uncoverEyes();
      }
    }, 100);
  }
}

function onConfirmPasswordToggleMouseDown(e) {
  showConfirmPasswordClicked = true;
}

function onConfirmPasswordToggleMouseUp(e) {
  showConfirmPasswordClicked = false;
}

function onConfirmPasswordToggleChange(e) {
  setTimeout(function () {
    if (e.target.checked) {
      confirmPassword.type = "text";
      spreadFingers();
    } else {
      confirmPassword.type = "password";
      closeFingers();
    }
  }, 100);
}

function onConfirmPasswordToggleClick(e) {
  e.target.focus();
}

function spreadFingers() {
  TweenMax.to(twoFingers, 0.35, {
    transformOrigin: "bottom left",
    rotation: 30,
    x: -9,
    y: -2,
    ease: Power2.easeInOut,
  });
}

function closeFingers() {
  TweenMax.to(twoFingers, 0.35, {
    transformOrigin: "bottom left",
    rotation: 0,
    x: 0,
    y: 0,
    ease: Power2.easeInOut,
  });
}

function coverEyes() {
  TweenMax.killTweensOf([armL, armR]);
  armL.style.visibility = "visible";
  armR.style.visibility = "visible";
  TweenMax.to(armL, 0.45, { x: -93, y: 10, rotation: 0, ease: Quad.easeOut });
  TweenMax.to(armR, 0.45, {
    x: -93,
    y: 10,
    rotation: 0,
    ease: Quad.easeOut,
    delay: 0.1,
  });
  TweenMax.to(bodyBG, 0.45, { morphSVG: bodyBGchanged, ease: Quad.easeOut });
  eyesCovered = true;
}

function uncoverEyes() {
  TweenMax.killTweensOf([armL, armR]);
  TweenMax.to(armL, 1.35, { y: 220, ease: Quad.easeOut });
  TweenMax.to(armL, 1.35, { rotation: 105, ease: Quad.easeOut, delay: 0.1 });
  TweenMax.to(armR, 1.35, { y: 220, ease: Quad.easeOut });
  TweenMax.to(armR, 1.35, {
    rotation: -105,
    ease: Quad.easeOut,
    delay: 0.1,
    onComplete: function () {
      armL.style.visibility = "hidden";
      armR.style.visibility = "hidden";
    },
  });
  TweenMax.to(bodyBG, 0.45, { morphSVG: bodyBG, ease: Quad.easeOut });
  eyesCovered = false;
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

function initResetPasswordForm() {
  [mouthSmallList, mouthMediumList, mouthLargeList, mouthOutlineList].forEach(
    (list) => list.forEach((el) => (el.style.display = "none"))
  );
  mouthSmallList.forEach((el) => (el.style.display = "block"));
  mouthOutlineList.forEach((el) => (el.style.display = "block"));
  changeMouthClipPath("Small");

  svgCoords = getPosition(mySVG);
  codeCoords = getPosition(code);
  screenCenter = svgCoords.x + mySVG.offsetWidth / 2;
  eyeLCoords = { x: svgCoords.x + 84, y: svgCoords.y + 76 };
  eyeRCoords = { x: svgCoords.x + 113, y: svgCoords.y + 76 };
  noseCoords = { x: svgCoords.x + 97, y: svgCoords.y + 81 };
  mouthCoords = { x: svgCoords.x + 100, y: svgCoords.y + 100 };

  code.addEventListener("focus", onCodeFocus);
  code.addEventListener("blur", onCodeBlur);
  code.addEventListener("input", onCodeInput);
  codeLabel.addEventListener("click", onCodeLabelClick);

  // Only allow numeric input for OTP code
  code.addEventListener("keydown", (e) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  });

  // Real-time validation for OTP code
  code.addEventListener("input", (e) => {
    const value = e.target.value;
    const inputGroup = e.target.closest(".inputGroup");
    
    if (value.length === 0) {
      inputGroup.classList.remove("valid", "invalid");
    } else if (value.length === 6 && /^\d+$/.test(value)) {
      inputGroup.classList.remove("invalid");
      inputGroup.classList.add("valid");
    } else {
      inputGroup.classList.remove("valid");
      inputGroup.classList.add("invalid");
    }
  });

  password.addEventListener("focus", onPasswordFocus);
  password.addEventListener("blur", onPasswordBlur);

  showPasswordCheck.addEventListener("change", onPasswordToggleChange);
  showPasswordCheck.addEventListener("focus", onPasswordToggleFocus);
  showPasswordCheck.addEventListener("blur", onPasswordToggleBlur);
  showPasswordCheck.addEventListener("click", onPasswordToggleClick);
  showPasswordToggle.addEventListener("mouseup", onPasswordToggleMouseUp);
  showPasswordToggle.addEventListener("mousedown", onPasswordToggleMouseDown);

  confirmPassword.addEventListener("focus", onPasswordFocus);
  confirmPassword.addEventListener("blur", onPasswordBlur);

  // Real-time validation for password
  password.addEventListener("input", (e) => {
    const value = e.target.value;
    const inputGroup = e.target.closest(".inputGroup");
    
    if (value.length === 0) {
      inputGroup.classList.remove("valid", "invalid");
    } else if (value.length >= 8) {
      inputGroup.classList.remove("invalid");
      inputGroup.classList.add("valid");
    } else {
      inputGroup.classList.remove("valid");
      inputGroup.classList.add("invalid");
    }
  });

  // Real-time validation for confirm password
  confirmPassword.addEventListener("input", (e) => {
    const value = e.target.value;
    const passwordValue = password.value;
    const inputGroup = e.target.closest(".inputGroup");
    
    if (value.length === 0) {
      inputGroup.classList.remove("valid", "invalid");
    } else if (value === passwordValue && passwordValue.length >= 8) {
      inputGroup.classList.remove("invalid");
      inputGroup.classList.add("valid");
    } else {
      inputGroup.classList.remove("valid");
      inputGroup.classList.add("invalid");
    }
  });

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

  codeScrollMax = code.scrollWidth;

  if (mouthBG) mouthBG.style.display = "none";
  mouthMediumBG.style.display = "none";
  mouthLargeBG.style.display = "none";
  mouthSmallBG.style.display = "block";
  mouthOutline.style.display = "block";
  changeMouthClipPath("Small");
}

initResetPasswordForm();
