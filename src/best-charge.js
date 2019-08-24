function bestCharge(selectedItems) {
  let countItem = countItems(selectedItems);
  let itemsInfo = getItems(countItem);
  let countRsult = countPrice(itemsInfo);
  return printInfo(itemsInfo, countRsult);
}

function countItems(selectedItems) {
  let items = [];
  selectedItems.forEach(element => {
    let idAndCount = element.split("x");
    items.push({
      id: idAndCount[0].trim(),
      count: idAndCount[1].trim()
    });
  });

  return items;
}

function getItems(countItem) {
  let itemsWithNamePrice = [];
  countItem.forEach(element => {
    let item = findItemById(element.id);
    item.count = element.count;
    itemsWithNamePrice.push(item);
  });
  return itemsWithNamePrice;
}

function countPrice(countItem) {
  let price = countPriceWithoutPromotion(countItem);
  let isOutFullPrice = judgeIsOutFulReducePrice(price);
  let fullReducePrice = getFullReducePrice(isOutFullPrice);
  let designateFoodOfferPrice = getDesignateFoodOfferPrice(countItem);
  let reduceResult = judgePrice(fullReducePrice, designateFoodOfferPrice);
  let resultPrice = countFinalyPrice(price, reduceResult.reducePrice);
  return {
    reducePrice: reduceResult.reducePrice,
    resultPrice: resultPrice,
    whichWay: reduceResult.whichWay
  };
}

function printInfo(countItem, countRsult) {
  let printResult = "";
  printResult += "============= 订餐明细 =============\n";
  printResult += printItems(countItem);
  printResult += "-----------------------------------\n";
  let promotionInfo = printPromotionInfo(countRsult.reducePrice, countRsult.whichWay);
  if (promotionInfo.length != 0) {
    printResult += promotionInfo
    printResult += "-----------------------------------\n";
  }
  printResult += printResultPriceInfo(countRsult.resultPrice)
  printResult += "===================================";
  return printResult;
}

function findItemById(id) {
  let items = loadAllItems();
  let item = {};
  for (let i = 0; i < items.length; i++) {
    let element = items[i];
    if (element.id === id) {
      item.id = element.id;
      item.name = element.name;
      item.price = element.price;
      break;
    }
  }
  return item;
}
function countPriceWithoutPromotion(countItem) {
  let priceWithoutPromotion = 0;
  countItem.forEach(item => {
    priceWithoutPromotion += Number(item.price) * Number(item.count);
  });
  return priceWithoutPromotion;
}

function judgeIsOutFulReducePrice(price) {
  if (Number(price) >= 30) {
    return true;
  } else {
    return false;
  }
}

function getFullReducePrice(isOutFullPrice) {
  if (isOutFullPrice) {
    return 6;
  } else {
    return 0;
  }
}

function getDesignateFoodOfferPrice(countItem) {
  let designateFoodIds = loadPromotions()[1].items;
  let canReduceItems = getCanReduceItems(designateFoodIds, countItem);
  return countCanReducePrice(canReduceItems)
}

function getCanReduceItems(designateFoodIds, countItem) {
  let canReduceItems = [];
  designateFoodIds.forEach(id => {
    countItem.forEach(item => {
      if (id.trim() == item.id) {
        canReduceItems.push(item);
      }
    });
  });
  return canReduceItems;
}

function countCanReducePrice(canReduceItems) {
  if (canReduceItems == null || canReduceItems.length == 0) {
    return 0;
  }
  let designateFoodOfferPriceSum = 0;
  canReduceItems.forEach(element => {
    designateFoodOfferPriceSum += Number(element.price) * 0.5 * Number(element.count);
  });
  return designateFoodOfferPriceSum;
}

function judgePrice(fullReducePrice, designateFoodOfferPrice) {
  if (Number(fullReducePrice) == 0 && Number(designateFoodOfferPrice) == 0) {
    return {
      reducePrice: 0,
      whichWay: "cant reduce"
    };
  }
  if (Number(fullReducePrice) >= Number(designateFoodOfferPrice)) {
    return {
      reducePrice: Number(fullReducePrice),
      whichWay: "full reduce"
    };
  } else {
    return {
      reducePrice: Number(designateFoodOfferPrice),
      whichWay: "specify half price of the dish"
    };
  }
}

function countFinalyPrice(price, reducePrice) {
  return Number(price) - Number(reducePrice);
}

function printItems(countItem) {
  let printItemsInfo = "";
  countItem.forEach(item => {
    printItemsInfo += printLine(item);
  });
  return printItemsInfo;
}

function printLine(item) {
  return `${item.name} x ${item.count} = ${Number(item.price) * Number(item.count)}元\n`;
}

function printPromotionInfo(reducePrice, whichWay) {
  if (Number(reducePrice) == 0) {
    return "";
  }
  if (whichWay == "full reduce") {
    return printFullReduceInfo(reducePrice);
  }
  return printDesignateFoodOfferInfo(reducePrice);
}

function printFullReduceInfo(reducePrice) {
  return `使用优惠:\n满30减${reducePrice}元，省${reducePrice}元\n`;
}

function printDesignateFoodOfferInfo(reducePrice) {
  let designateFoodIds = loadPromotions()[1].items;
  let designateFoodItemsNames = "";
  for (let i = 0; i < designateFoodIds.length; i++) {
    designateFoodItemsNames += i < designateFoodIds.length - 1 ? `${findItemById(designateFoodIds[i]).name}，` : findItemById(designateFoodIds[i]).name;
  }
  return `使用优惠:\n指定菜品半价(${designateFoodItemsNames})，省${reducePrice}元\n`;
}

function printResultPriceInfo(resultPrice) {
  return `总计：${resultPrice}元\n`;
}