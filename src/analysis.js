const { getTrips, getDriver } = require('api');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  // Your code goes here
  
  const responseData = await getTrips();

  const numberConvertedData = responseData.map(object => {
    object.billedAmount = parseFloat(String(object.billedAmount).replace(/,/g, ''));
    return object;
  })

  const billed = {
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    billedTotal: 0,
    cashBilledTotal: 0,
    nonCashBilledTotal: 0
  };

  const singleDriverIdArray = [];
  const tripCount = {};
  const driversEarning = {};
  for (let object of numberConvertedData) {
    if (object.isCash === true) {
      billed.noOfCashTrips = ++billed.noOfCashTrips;
      billed.cashBilledTotal = billed.cashBilledTotal + object.billedAmount;
    } else {
      billed.noOfNonCashTrips = ++billed.noOfNonCashTrips;
      billed.nonCashBilledTotal = billed.nonCashBilledTotal + object.billedAmount;
    }

    billed.billedTotal = billed.billedTotal + object.billedAmount;

    if (!singleDriverIdArray.includes(object.driverID)) {
      singleDriverIdArray.push(object.driverID);
    }

    if (object) {
      tripCount[object.driverID] = ++tripCount[object.driverID] || 1;
      driversEarning[object.driverID] = driversEarning[object.driverID] + object.billedAmount || object.billedAmount;
    }
  }
  // billed

  const tripCountValues = Object.values(tripCount);
  const tripCountMax = Math.max(...tripCountValues);
  const tripcountMaxIndex = tripCountValues.indexOf(tripCountMax);

  const earningValues = Object.values(driversEarning);
  const earningValuesMax = Math.max(...earningValues);
  const earningValuesMaxIndex = earningValues.indexOf(earningValuesMax);

  const driverPromise = [];
  for (let driverId of singleDriverIdArray) {
    driverPromise.push(getDriver(driverId));
  }
  
  const driverPromiseStatus = await Promise.allSettled(driverPromise);
  driverPromiseStatus
  
  let driverCounter = 0;
  for (let driver of driverPromiseStatus) {
    if (driver.status === 'fulfilled' && driver.value.vehicleID.length > 1) {
      ++driverCounter;
    }
  }

  const output = {};
  output['noOfCashTrips'] = billed.noOfCashTrips;
  output['noOfNonCashTrips'] = billed.noOfNonCashTrips;
  output['billedTotal'] = Number(billed.billedTotal.toFixed(2));
  output['cashBilledTotal'] = Number(billed.cashBilledTotal.toFixed(2));
  output['nonCashBilledTotal'] = Number(billed.nonCashBilledTotal.toFixed(2));
  output['noOfDriversWithMoreThanOneVehicle'] = driverCounter;
  output['mostTripsByDriver'] = {
    name: driverPromiseStatus[tripcountMaxIndex].value.name,
    email: driverPromiseStatus[tripcountMaxIndex].value.email,
    phone: driverPromiseStatus[tripcountMaxIndex].value.phone,
    noOfTrips: tripCountMax,
    totalAmountEarned: earningValues[tripcountMaxIndex]
  };
  output['highestEarningDriver'] = {
    name: driverPromiseStatus[earningValuesMaxIndex].value.name,
    email: driverPromiseStatus[earningValuesMaxIndex].value.email,
    phone: driverPromiseStatus[earningValuesMaxIndex].value.phone,
    noOfTrips: tripCountValues[earningValuesMaxIndex],
    totalAmountEarned: earningValues[earningValuesMaxIndex]
  };
  output

  return output;
}
analysis()
module.exports = analysis;

