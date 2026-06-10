const refs = {
  form: document.querySelector("#orderForm"),
  formSteps: document.querySelectorAll(".form-step"),
  stepTabs: document.querySelectorAll(".step-tab"),
  nextStepButton: document.querySelector("#nextStepButton"),
  prevStepButton: document.querySelector("#prevStepButton"),
  itemsList: document.querySelector("#itemsList"),
  itemTemplate: document.querySelector("#itemTemplate"),
  addItemButton: document.querySelector("#addItemButton"),
  customerName: document.querySelector("#customerName"),
  email: document.querySelector("#email"),
  phone: document.querySelector("#phone"),
  customsCode: document.querySelector("#customsCode"),
  sameBuyerButton: document.querySelector("#sameBuyerButton"),
  recipientNameKo: document.querySelector("#recipientNameKo"),
  recipientNameEn: document.querySelector("#recipientNameEn"),
  recipientPhone: document.querySelector("#recipientPhone"),
  customsType: document.querySelector("#customsType"),
  businessCustomsNotice: document.querySelector("#businessCustomsNotice"),
  recipientCustomsCode: document.querySelector("#recipientCustomsCode"),
  postcodeButton: document.querySelector("#postcodeButton"),
  postalCode: document.querySelector("#postalCode"),
  addressKo: document.querySelector("#addressKo"),
  addressDetail: document.querySelector("#addressDetail"),
  addressEn: document.querySelector("#addressEn"),
  convertAddressButton: document.querySelector("#convertAddressButton"),
  addressStatus: document.querySelector("#addressStatus"),
  postcodeLayer: document.querySelector("#postcodeLayer"),
  memo: document.querySelector("#memo"),
  productTotal: document.querySelector("#productTotal"),
  domesticTotal: document.querySelector("#domesticTotal"),
  serviceFee: document.querySelector("#serviceFee"),
  grandTotal: document.querySelector("#grandTotal"),
  quoteNote: document.querySelector("#quoteNote"),
  submitRequestButton: document.querySelector("#submitRequestButton"),
  customerStatus: document.querySelector("#customerStatus"),
  noticeScroll: document.querySelector("#noticeScroll"),
  damageWaiverScroll: document.querySelector("#damageWaiverScroll"),
  noticeHint: document.querySelector("#noticeHint"),
  damageWaiverHint: document.querySelector("#damageWaiverHint"),
  noticeReadCheck: document.querySelector("#noticeReadCheck"),
  damageWaiverCheck: document.querySelector("#damageWaiverCheck"),
  agreementCheck: document.querySelector("#agreementCheck"),
  cashReceiptCheck: document.querySelector("#cashReceiptCheck"),
  cashReceiptPhone: document.querySelector("#cashReceiptPhone"),
  taxInvoiceCheck: document.querySelector("#taxInvoiceCheck"),
  taxInvoiceFields: document.querySelector("#taxInvoiceFields"),
  taxBusinessNumber: document.querySelector("#taxBusinessNumber"),
  businessCertificateFiles: document.querySelector("#businessCertificateFiles"),
  businessFileCount: document.querySelector("#businessFileCount"),
  privacyCheck: document.querySelector("#privacyCheck"),
  consignmentCheck: document.querySelector("#consignmentCheck"),
  adminLogin: document.querySelector("#adminLogin"),
  adminId: document.querySelector("#adminId"),
  adminPassword: document.querySelector("#adminPassword"),
  adminLoginButton: document.querySelector("#adminLoginButton"),
  adminLogoutButton: document.querySelector("#adminLogoutButton"),
  loginStatus: document.querySelector("#loginStatus"),
  adminPrivateSections: document.querySelectorAll(".admin-private"),
  adminExchangeRate: document.querySelector("#adminExchangeRate"),
  adminServiceRate: document.querySelector("#adminServiceRate"),
  adminMinimumFee: document.querySelector("#adminMinimumFee"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  settingsStatus: document.querySelector("#settingsStatus"),
  orderSummary: document.querySelector("#orderSummary"),
  confirmOrderButton: document.querySelector("#confirmOrderButton"),
  rejectOrderButton: document.querySelector("#rejectOrderButton"),
  downloadCsvButton: document.querySelector("#downloadCsvButton"),
  adminStatus: document.querySelector("#adminStatus"),
  depositSubject: document.querySelector("#depositSubject"),
  depositTemplate: document.querySelector("#depositTemplate"),
  actualWeight: document.querySelector("#actualWeight"),
  internationalFee: document.querySelector("#internationalFee"),
  shippingSubject: document.querySelector("#shippingSubject"),
  shippingTemplate: document.querySelector("#shippingTemplate"),
  sendShippingButton: document.querySelector("#sendShippingButton"),
  settlementFirst: document.querySelector("#settlementFirst"),
  settlementSecond: document.querySelector("#settlementSecond"),
  settlementStatus: document.querySelector("#settlementStatus"),
  mailCount: document.querySelector("#mailCount"),
  mailLog: document.querySelector("#mailLog"),
};

const settings = {
  exchangeRate: 50,
  serviceRate: 0.08,
  minimumServiceFee: 5000,
  bankInfo: "국민 123456-00-789012 / 예금주: 대만iN",
};

let latestQuote = null;
let orderStatus = "신청 전";
let mailCount = 0;
let isAdminLoggedIn = false;
let isAddressConverted = false;
let selectedAddressEnglish = "";
let currentStep = "basicStep";

function money(value) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function numberValue(input, fallback = 0) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function showStep(stepId) {
  currentStep = stepId;
  refs.formSteps.forEach((step) => {
    step.hidden = step.id !== stepId;
    step.classList.toggle("is-active", step.id === stepId);
  });
  refs.stepTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.stepTarget === stepId);
  });
  refs.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectedShippingType() {
  return document.querySelector('input[name="shippingType"]:checked')?.value || "";
}

function selectedShippingRequests() {
  return Array.from(document.querySelectorAll(".shipping-request:checked")).map((input) => input.value);
}

function refreshBusinessCustomsNotice() {
  const isBusiness = refs.customsType.value === "business";
  refs.businessCustomsNotice.hidden = !isBusiness;
}

function romanizeKoreanName(name) {
  const compact = name.replace(/\s+/g, "");
  const surnameMap = {
    김: "Kim",
    이: "Lee",
    박: "Park",
    최: "Choi",
    정: "Jung",
    강: "Kang",
    조: "Cho",
    윤: "Yoon",
    장: "Jang",
    임: "Lim",
    한: "Han",
    오: "Oh",
    서: "Seo",
    신: "Shin",
    권: "Kwon",
    황: "Hwang",
    안: "Ahn",
    송: "Song",
    전: "Jeon",
    홍: "Hong",
  };
  const special = {
    유: "Yu",
    찬: "Chan",
    길: "Gil",
    동: "Dong",
  };
  if (!compact) return "";
  const surname = surnameMap[compact[0]] || romanizeHangul(compact[0]);
  const given = Array.from(compact.slice(1)).map((char) => special[char] || romanizeHangul(char));
  return [surname, ...given].filter(Boolean).join(" ");
}

function romanizeHangul(char) {
  const code = char.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return char;
  const initials = ["G", "Kk", "N", "D", "Tt", "R", "M", "B", "Pp", "S", "Ss", "", "J", "Jj", "Ch", "K", "T", "P", "H"];
  const vowels = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
  const finals = ["", "k", "k", "ks", "n", "nj", "nh", "t", "l", "lk", "lm", "lb", "ls", "lt", "lp", "lh", "m", "p", "ps", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];
  const initial = Math.floor(code / 588);
  const vowel = Math.floor((code % 588) / 28);
  const final = code % 28;
  return `${initials[initial]}${vowels[vowel]}${finals[final]}`.replace(/^./, (letter) => letter.toUpperCase());
}

function romanizeAddress(address) {
  const normalized = address.replace(/\s+/g, " ").trim();
  const unitMatch = normalized.match(/(\d+)동\s*(\d+)호/);
  const unit = unitMatch ? `${unitMatch[1]}-${unitMatch[2]}` : "";
  const roadMatch = normalized.match(/([가-힣0-9]+로[0-9]*번길|[가-힣0-9]+로|[가-힣0-9]+길)\s*(\d+)/);
  const road = roadMatch ? `${roadMatch[2]}, ${romanizeRoad(roadMatch[1])}` : normalized;
  const parts = [
    unit,
    road,
    normalized.includes("기흥구") ? "Giheung-gu" : "",
    normalized.includes("용인시") ? "Yongin-si" : "",
    normalized.includes("경기도") ? "Gyeonggi-do" : "",
    "Republic of Korea",
  ].filter(Boolean);
  return parts.join(", ");
}

function resetAddressConversion() {
  isAddressConverted = false;
  refs.addressEn.value = "";
  refs.addressStatus.textContent = "주소 정보가 변경되었습니다. 영문주소 변환을 다시 눌러주세요.";
  refreshSubmitAvailability();
}

function buildKoreanAddress() {
  return [refs.addressKo.value.trim(), refs.addressDetail.value.trim()].filter(Boolean).join(" ");
}

function formatAddressDetail(detail) {
  return detail
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(\d+)동\s*(\d+)호/g, "$1-$2")
    .replace(/(\d+)동/g, "$1-dong")
    .replace(/(\d+)호/g, "Unit $1");
}

function convertEnglishAddress() {
  if (!refs.postalCode.value.trim() || !refs.addressKo.value.trim() || !refs.addressDetail.value.trim()) {
    refs.addressStatus.textContent = "우편번호, 한글주소, 상세주소를 모두 입력한 뒤 영문주소 변환을 눌러주세요.";
    return;
  }

  const detail = formatAddressDetail(refs.addressDetail.value);
  const baseAddress = selectedAddressEnglish || romanizeAddress(buildKoreanAddress());
  refs.addressEn.value = [detail, baseAddress].filter(Boolean).join(", ");
  isAddressConverted = true;
  refs.addressStatus.textContent = "영문주소 변환이 완료되었습니다. 내용을 확인해주세요.";
  refreshSubmitAvailability();
}

function romanizeRoad(text) {
  return text
    .replace("번길", "beon-gil")
    .replace("로", "-ro")
    .replace("길", "-gil");
}

function itemCards() {
  return Array.from(refs.itemsList.querySelectorAll(".item-card"));
}

function readItems() {
  return itemCards().map((card, index) => {
    const name = card.querySelector(".item-name").value || `품목 ${index + 1}`;
    const url = card.querySelector(".item-url").value;
    const priceTwd = numberValue(card.querySelector(".item-price"));
    const domesticTwd = numberValue(card.querySelector(".item-domestic"));
    const quantity = Math.max(numberValue(card.querySelector(".item-qty"), 1), 1);
    const color = card.querySelector(".item-color").value;
    const size = card.querySelector(".item-size").value;
    const option = card.querySelector(".item-option").value;
    const imageCount = card.querySelector(".item-images").files.length;
    const itemTotalTwd = priceTwd * quantity;
    const krw = itemTotalTwd * settings.exchangeRate;
    const domesticKrw = domesticTwd * settings.exchangeRate;
    return { name, url, priceTwd, domesticTwd, quantity, color, size, option, imageCount, itemTotalTwd, krw, domesticKrw };
  });
}

function calculateQuote() {
  const items = readItems();
  const productTotal = items.reduce((sum, item) => sum + item.krw, 0);
  const domesticTotal = items.reduce((sum, item) => sum + item.domesticKrw, 0);
  const serviceFee = Math.max(productTotal * settings.serviceRate, settings.minimumServiceFee);
  const grandTotal = productTotal + domesticTotal + serviceFee;

  latestQuote = { items, productTotal, domesticTotal, serviceFee, grandTotal };
  refs.productTotal.textContent = money(productTotal);
  refs.domesticTotal.textContent = money(domesticTotal);
  refs.serviceFee.textContent = money(serviceFee);
  refs.grandTotal.textContent = money(grandTotal);
  refs.quoteNote.textContent = `현재 적용 환율: 1 NTD = ${settings.exchangeRate.toLocaleString("ko-KR")}원 / 국제배송비는 2차 결제입니다.`;
  refs.settlementFirst.textContent = money(grandTotal);
  itemCards().forEach((card, index) => {
    const item = items[index];
    card.querySelector(".item-total-price").textContent = `${item.itemTotalTwd.toLocaleString("ko-KR")} NTD / ${money(item.krw)}`;
  });
}

function refreshItemTitles() {
  itemCards().forEach((card, index) => {
    card.querySelector(".item-title").textContent = `품목 ${index + 1}`;
    card.querySelector(".remove-item").disabled = itemCards().length === 1;
  });
}

function addItem(defaults = {}) {
  const fragment = refs.itemTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".item-card");
  if (defaults.name) card.querySelector(".item-name").value = defaults.name;
  if (defaults.url) card.querySelector(".item-url").value = defaults.url;
  if (defaults.priceTwd) card.querySelector(".item-price").value = defaults.priceTwd;
  if (defaults.domesticTwd) card.querySelector(".item-domestic").value = defaults.domesticTwd;
  if (defaults.quantity) card.querySelector(".item-qty").value = defaults.quantity;
  if (defaults.color) card.querySelector(".item-color").value = defaults.color;
  if (defaults.size) card.querySelector(".item-size").value = defaults.size;
  if (defaults.option) card.querySelector(".item-option").value = defaults.option;

  refs.itemsList.append(fragment);
  refreshItemTitles();
  calculateQuote();
}

function renderOrderSummary() {
  calculateQuote();
  const itemRows = latestQuote.items
    .map(
      (item) => `
        <li>
          <strong>${item.name}</strong>
          <span>${item.priceTwd.toLocaleString("ko-KR")} NTD x ${item.quantity}개 / 내륙배송 ${item.domesticTwd.toLocaleString("ko-KR")} NTD = ${money(item.krw + item.domesticKrw)}</span>
        </li>
      `,
    )
    .join("");

  refs.orderSummary.innerHTML = `
    <dl>
      <div><dt>고객</dt><dd>${refs.customerName.value || "미입력"}</dd></div>
      <div><dt>이메일</dt><dd>${refs.email.value || "미입력"}</dd></div>
      <div><dt>연락처</dt><dd>${refs.phone.value || "미입력"}</dd></div>
      <div><dt>개인통관고유번호</dt><dd>${refs.customsCode.value || "미입력"}</dd></div>
      <div><dt>수취인</dt><dd>${refs.recipientNameKo.value || "미입력"} / ${refs.recipientNameEn.value || "미입력"}</dd></div>
      <div><dt>통관 유형</dt><dd>${refs.customsType.options[refs.customsType.selectedIndex].text}</dd></div>
      <div><dt>수취인 연락처</dt><dd>${refs.recipientPhone.value || "미입력"}</dd></div>
      <div><dt>우편번호</dt><dd>${refs.postalCode.value || "미입력"}</dd></div>
      <div><dt>1차 예상금액</dt><dd>${money(latestQuote.grandTotal)}</dd></div>
      <div><dt>배송유형</dt><dd>${selectedShippingType() || "미선택"}</dd></div>
      <div><dt>배송요청</dt><dd>${selectedShippingRequests().join(", ") || "없음"}</dd></div>
      <div><dt>현금영수증</dt><dd>${refs.cashReceiptCheck.checked ? refs.cashReceiptPhone.value || "요청" : "미요청"}</dd></div>
      <div><dt>세금계산서</dt><dd>${refs.taxInvoiceCheck.checked ? refs.taxBusinessNumber.value || "요청" : "미요청"}</dd></div>
      <div><dt>요청사항</dt><dd>${refs.memo.value || "없음"}</dd></div>
    </dl>
    <ul>${itemRows}</ul>
  `;
}

function setStatus(status) {
  orderStatus = status;
  refs.settlementStatus.textContent = status;
}

function setAdminAccess(isAllowed) {
  isAdminLoggedIn = isAllowed;
  refs.adminPrivateSections.forEach((section) => {
    section.hidden = !isAllowed;
  });
  refs.adminLogoutButton.hidden = !isAllowed;
  refs.adminLoginButton.hidden = isAllowed;

  if (isAllowed) {
    refs.loginStatus.textContent = "관리자 로그인 완료: 운영관리 화면이 열렸습니다.";
  } else {
    refs.loginStatus.textContent = "테스트 계정: admin / taiwanin1234";
  }
}

function fillTemplate(template) {
  const internationalFee = numberValue(refs.internationalFee);
  return template
    .replaceAll("{{customerName}}", refs.customerName.value || "고객")
    .replaceAll("{{grandTotal}}", money(latestQuote.grandTotal))
    .replaceAll("{{productTotal}}", money(latestQuote.productTotal))
    .replaceAll("{{serviceFee}}", money(latestQuote.serviceFee))
    .replaceAll("{{actualWeight}}", numberValue(refs.actualWeight).toLocaleString("ko-KR"))
    .replaceAll("{{internationalFee}}", money(internationalFee))
    .replaceAll("{{bankInfo}}", settings.bankInfo);
}

function logMail(type, subject, body) {
  mailCount += 1;
  refs.mailCount.textContent = `${mailCount}건`;

  const empty = refs.mailLog.querySelector(".empty-state");
  if (empty) empty.remove();

  const article = document.createElement("article");
  article.className = "mail-card";
  article.innerHTML = `
    <div>
      <span>${type}</span>
      <strong>${subject}</strong>
    </div>
    <p>수신: ${refs.email.value || "미입력"}</p>
    <pre>${body}</pre>
  `;
  refs.mailLog.prepend(article);
}

function refreshSubmitAvailability() {
  const canSubmit =
    refs.noticeReadCheck.checked &&
    refs.damageWaiverCheck.checked &&
    refs.agreementCheck.checked &&
    refs.privacyCheck.checked &&
    refs.consignmentCheck.checked &&
    Boolean(selectedShippingType()) &&
    isAddressConverted;
  refs.submitRequestButton.disabled = !canSubmit;
  if (!canSubmit) {
    refs.customerStatus.textContent =
      "유의사항 확인, 영문주소 변환, 배송유형 선택, 개인정보 동의를 완료해야 신청서를 접수할 수 있습니다.";
  } else if (orderStatus === "신청 전") {
    refs.customerStatus.textContent = "신청서 접수 준비가 완료되었습니다.";
  }
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv() {
  renderOrderSummary();
  const rows = [
    [
      "접수상태",
      "고객명",
      "이메일",
      "연락처",
      "개인통관고유번호",
      "수취인명한글",
      "수취인명영문",
      "수취인연락처",
      "통관유형",
      "수취인통관번호",
      "우편번호",
      "한국주소",
      "상세주소",
      "영문주소",
      "배송유형",
      "배송요청사항",
      "현금영수증요청",
      "현금영수증전화번호",
      "세금계산서요청",
      "세금계산서사업자번호",
      "사업자등록증첨부수",
      "품목번호",
      "상품명",
      "상품URL",
      "옵션",
      "상품가TWD",
      "대만내륙배송비NTD",
      "수량",
      "색상",
      "사이즈",
      "이미지수",
      "환율",
      "상품금액KRW",
      "대만내륙배송비KRW",
      "구매대행수수료",
      "1차입금예정액",
      "2차국제배송비",
      "요청사항",
    ],
  ];

  latestQuote.items.forEach((item, index) => {
    rows.push([
      orderStatus,
      refs.customerName.value,
      refs.email.value,
      refs.phone.value,
      refs.customsCode.value,
      refs.recipientNameKo.value,
      refs.recipientNameEn.value,
      refs.recipientPhone.value,
      refs.customsType.options[refs.customsType.selectedIndex].text,
      refs.recipientCustomsCode.value,
      refs.postalCode.value,
      refs.addressKo.value,
      refs.addressDetail.value,
      refs.addressEn.value,
      selectedShippingType(),
      selectedShippingRequests().join(" / "),
      refs.cashReceiptCheck.checked ? "Y" : "N",
      refs.cashReceiptPhone.value,
      refs.taxInvoiceCheck.checked ? "Y" : "N",
      refs.taxBusinessNumber.value,
      refs.businessCertificateFiles.files.length,
      index + 1,
      item.name,
      item.url,
      item.option,
      item.priceTwd,
      item.domesticTwd,
      item.quantity,
      item.color,
      item.size,
      item.imageCount,
      settings.exchangeRate,
      Math.round(item.krw),
      Math.round(item.domesticKrw),
      Math.round(latestQuote.serviceFee),
      Math.round(latestQuote.grandTotal),
      numberValue(refs.internationalFee),
      refs.memo.value,
    ]);
  });

  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `taiwanin-order-${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

refs.addItemButton.addEventListener("click", () => {
  addItem({
    name: "추가 상품",
    url: "https://example.tw/product/additional",
    priceTwd: 800,
    quantity: 1,
    option: "옵션 입력",
  });
});

refs.itemsList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-item")) return;
  if (itemCards().length <= 1) return;
  event.target.closest(".item-card").remove();
  refreshItemTitles();
  calculateQuote();
});

refs.itemsList.addEventListener("change", (event) => {
  if (!event.target.classList.contains("item-images")) return;
  const input = event.target;
  if (input.files.length > 3) {
    input.value = "";
    input.closest(".item-card").querySelector(".image-count").textContent = "0/3";
    refs.customerStatus.textContent = "이미지는 품목당 최대 3장까지 등록 가능합니다.";
    return;
  }
  input.closest(".item-card").querySelector(".image-count").textContent = `${input.files.length}/3`;
  calculateQuote();
});

refs.form.addEventListener("input", calculateQuote);
refs.form.addEventListener("change", calculateQuote);

refs.stepTabs.forEach((tab) => {
  tab.addEventListener("click", () => showStep(tab.dataset.stepTarget));
});

refs.nextStepButton.addEventListener("click", () => showStep("optionStep"));
refs.prevStepButton.addEventListener("click", () => showStep("basicStep"));

refs.customsType.addEventListener("change", refreshBusinessCustomsNotice);

refs.taxInvoiceCheck.addEventListener("change", () => {
  refs.taxInvoiceFields.hidden = !refs.taxInvoiceCheck.checked;
});

refs.businessCertificateFiles.addEventListener("change", () => {
  if (refs.businessCertificateFiles.files.length > 3) {
    refs.businessCertificateFiles.value = "";
    refs.businessFileCount.textContent = "파일은 최대 3개까지 첨부할 수 있습니다.";
    return;
  }
  refs.businessFileCount.textContent = `${refs.businessCertificateFiles.files.length}/3개 첨부됨`;
});

document.querySelectorAll('input[name="shippingType"]').forEach((input) => {
  input.addEventListener("change", refreshSubmitAvailability);
});

document.querySelectorAll(".shipping-request").forEach((input) => {
  input.addEventListener("change", () => {
    const noneOption = document.querySelector('.shipping-request[value="배송요청사항 없음"]');
    if (input === noneOption && input.checked) {
      document.querySelectorAll(".shipping-request").forEach((other) => {
        if (other !== noneOption) other.checked = false;
      });
    }
    if (input !== noneOption && input.checked) {
      noneOption.checked = false;
    }
  });
});

[refs.privacyCheck, refs.consignmentCheck].forEach((input) => {
  input.addEventListener("change", refreshSubmitAvailability);
});

refs.sameBuyerButton.addEventListener("click", () => {
  refs.recipientNameKo.value = refs.customerName.value;
  refs.recipientNameEn.value = romanizeKoreanName(refs.customerName.value);
  refs.recipientPhone.value = refs.phone.value;
  refs.recipientCustomsCode.value = refs.customsCode.value;
  refs.customerStatus.textContent = "구매자 정보가 수취인 정보에 적용되었습니다.";
});

refs.recipientNameKo.addEventListener("input", () => {
  refs.recipientNameEn.value = romanizeKoreanName(refs.recipientNameKo.value);
});

refs.postcodeButton.addEventListener("click", () => {
  if (!window.daum?.Postcode) {
    refs.addressStatus.textContent = "카카오 우편번호 검색을 불러오지 못했습니다. 네트워크 연결 또는 스크립트 로드를 확인해주세요.";
    return;
  }

  refs.postcodeLayer.hidden = true;
  refs.addressStatus.textContent = "팝업에서 주소를 검색한 뒤 사용할 주소를 선택해주세요.";
  new window.daum.Postcode({
    oncomplete(data) {
      const selectedAddress = data.roadAddress || data.jibunAddress || "";
      selectedAddressEnglish =
        data.roadAddressEnglish || data.jibunAddressEnglish || data.addressEnglish || "";
      refs.postalCode.value = data.zonecode;
      refs.addressKo.value = selectedAddress;
      resetAddressConversion();
      refs.addressStatus.textContent = "주소가 입력되었습니다. 상세 주소 입력 후 영문주소 변환을 눌러주세요.";
      refs.addressDetail.focus();
    },
  }).open({
    popupName: "taiwaninPostcode",
    left: window.screenX + 80,
    top: window.screenY + 80,
  });
});

refs.addressDetail.addEventListener("input", resetAddressConversion);

refs.convertAddressButton.addEventListener("click", () => {
  convertEnglishAddress();
});

refs.noticeScroll.addEventListener("scroll", () => {
  const isAtBottom =
    refs.noticeScroll.scrollTop + refs.noticeScroll.clientHeight >= refs.noticeScroll.scrollHeight - 8;
  if (isAtBottom) {
    refs.noticeReadCheck.disabled = false;
    refs.noticeHint.textContent = "아래 체크 가능";
    refs.noticeHint.classList.add("is-done");
  }
});

refs.damageWaiverScroll.addEventListener("scroll", () => {
  const isAtBottom =
    refs.damageWaiverScroll.scrollTop + refs.damageWaiverScroll.clientHeight >=
    refs.damageWaiverScroll.scrollHeight - 8;
  if (isAtBottom) {
    refs.damageWaiverCheck.disabled = false;
    refs.damageWaiverHint.textContent = "아래 동의 가능";
    refs.damageWaiverHint.classList.add("is-done");
  }
});

[refs.noticeReadCheck, refs.damageWaiverCheck, refs.agreementCheck].forEach((input) => {
  input.addEventListener("change", refreshSubmitAvailability);
});

refs.adminLoginButton.addEventListener("click", () => {
  const id = refs.adminId.value.trim();
  const password = refs.adminPassword.value;
  const isValid = id === "admin" && password === "taiwanin1234";

  if (!isValid) {
    setAdminAccess(false);
    refs.loginStatus.textContent = "아이디 또는 비밀번호가 맞지 않습니다.";
    return;
  }

  setAdminAccess(true);
  document.querySelector("#admin").scrollIntoView({ behavior: "smooth", block: "start" });
});

refs.adminLogoutButton.addEventListener("click", () => {
  refs.adminPassword.value = "";
  setAdminAccess(false);
  document.querySelector("#adminLogin").scrollIntoView({ behavior: "smooth", block: "start" });
});

refs.saveSettingsButton.addEventListener("click", () => {
  if (!isAdminLoggedIn) return;
  settings.exchangeRate = Math.max(numberValue(refs.adminExchangeRate, 50), 1);
  settings.serviceRate = Math.max(numberValue(refs.adminServiceRate, 8), 0) / 100;
  settings.minimumServiceFee = Math.max(numberValue(refs.adminMinimumFee, 5000), 0);
  refs.settingsStatus.textContent = `설정 적용 완료: 환율 ${settings.exchangeRate.toLocaleString("ko-KR")}원, 수수료 ${Math.round(settings.serviceRate * 1000) / 10}%`;
  calculateQuote();
  renderOrderSummary();
});

refs.submitRequestButton.addEventListener("click", () => {
  if (refs.submitRequestButton.disabled) return;
  renderOrderSummary();
  setStatus("관리자 확인 대기");
  refs.customerStatus.textContent = "신청서가 관리자 페이지에 접수되었습니다. 금액 확인 후 입금 안내가 발송됩니다.";
  refs.adminStatus.textContent = "신규 신청 접수: 금액 확인이 필요합니다.";
});

refs.confirmOrderButton.addEventListener("click", () => {
  if (!isAdminLoggedIn) return;
  renderOrderSummary();
  setStatus("1차 입금 안내 발송");
  const body = fillTemplate(refs.depositTemplate.value);
  logMail("1차 입금 안내", refs.depositSubject.value, body);
  refs.adminStatus.textContent = "접수 확인 완료: 고객에게 1차 입금 안내 메일이 발송된 것으로 기록했습니다.";
});

refs.rejectOrderButton.addEventListener("click", () => {
  if (!isAdminLoggedIn) return;
  renderOrderSummary();
  setStatus("반려");
  refs.adminStatus.textContent = "금액 상이 또는 재고 확인 필요로 신청을 반려 처리했습니다.";
});

refs.downloadCsvButton.addEventListener("click", () => {
  if (!isAdminLoggedIn) return;
  downloadCsv();
});

refs.sendShippingButton.addEventListener("click", () => {
  if (!isAdminLoggedIn) return;
  calculateQuote();
  setStatus("2차 국제배송비 안내 발송");
  const fee = Math.max(numberValue(refs.internationalFee), 0);
  refs.settlementSecond.textContent = money(fee);
  const body = fillTemplate(refs.shippingTemplate.value);
  logMail("2차 국제배송비 안내", refs.shippingSubject.value, body);
});

addItem();
setStatus(orderStatus);
setAdminAccess(false);
refreshBusinessCustomsNotice();
refreshSubmitAvailability();
