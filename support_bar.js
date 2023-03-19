const storeKey = "sh143_support_bar";
let support = 0;
let tiers = {};
let maxDigits = 2;
let setSupport = 0

window.addEventListener('onEventReceived', function (obj) {
  if (!obj.detail.event) {
    return;
  }
  if (typeof obj.detail.event.itemId !== "undefined") {
    obj.detail.listener = "redemption-latest"
  }
  
  const listener = obj.detail.listener || obj.detail.name;
  const event = obj.detail.event || obj.detail.data;
  

  if (listener === 'tip-latest') {
    add(event.amount);
  }
  else if(listener === 'cheer-latest') {
    add(event.amount / 100);
  }
  else if(listener === 'subscriber-latest') {
    if(event.isCommunityGift) {
      // skip single gift events
      return;
    }
    const subCount = event.bulkGifted ? event.amount : 1;
    const value = tiers[event.tier] * subCount;
    
    add(value);
  }
  else if(event.listener === "widget-button") {
    if(event.field === "sh143_support_barAdd") {
      support += setSupport;
      update();
    }
    else if(event.field === "sh143_support_barSet") {
      support = setSupport;
      update();
    }
    else if(event.field === "sh143_support_barReset") {
      support = 0;
      update();
    }
  }
  
});

function add(amount) {
  if(!amount) {
    return;
  }
  
  support += amount;
  update();
}

function trimDigits(val, digits = 2) {
  return Math.round(val * (10 ** digits)) / (10 ** digits);
}

function update(save = true, animate = true) {
  console.log(support, goal)
  
  const percentage = goal ? trimDigits((support / goal) * 100, maxDigits) : 0;
  
  document.querySelector("#support").textContent = `${trimDigits(support)} € (${percentage}%)`;
  
  const graph = document.querySelector("#bar");
  
  graph.classList.add("noAnimation");
  graph.offsetHeight;
  graph.classList.remove("noAnimation");
  
  if(!animate) {
    graph.classList.add("noAnimation");
  }
  graph.style.width = `${Math.min(percentage, 100)}%`;
  if(!animate) {
    graph.offsetHeight;
    graph.classList.remove("noAnimation");
  }
  
  if(save) {
    SE_API.store.set(storeKey, { support });
  }
}

window.addEventListener('onWidgetLoad', function (obj) {
  const {fieldData} = obj.detail;
  maxDigits = fieldData["maxDigits"];
  goal = fieldData["goal"];
  setSupport = fieldData["value"];
  
  tiers = {
    prime: fieldData["tier1"],
    1: fieldData["tier1"],
    1000: fieldData["tier1"],
    2: fieldData["tier2"],
    2000: fieldData["tier2"],
    3: fieldData["tier3"],
    3000: fieldData["tier3"]
  }
  
  SE_API.store.get(storeKey).then(obj => {
    support = obj.support || 0;
    update(false, false);
  });
  
});
