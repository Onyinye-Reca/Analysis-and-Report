const { getTrips, getDriver, getVehicle } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  // Your code goes here
  const response = await getTrips();

  const driverIdArray = response.map(object => {
    return object.driverID;
  })

  const singleDriverIdArray = Array.from(new Set(driverIdArray));

  const output = [];
  
  const createUser = trip => {
    const user = {
      "user": trip.user.name,
        "created": trip.created,
        "pickup": trip.pickup.address,
        "destination": trip.destination.address,
        "billed": parseFloat(String(trip.billedAmount).replace(/,/g, '')),
        "isCash": trip.isCash
    };
    return user;
  }

  const createVehicle = array => {
    const vehicleArray = array.map(object => {
      const plate = object.value.plate;
      const manufacturer = object.value.manufacturer;
      return {"plate": plate, "manufacturer": manufacturer};
    })
    return vehicleArray;
  }

  const driverPromise = [];
  for (let driverId of singleDriverIdArray) {
    driverPromise.push(getDriver(driverId));
  }
  
  const driverPromiseStatus = await Promise.allSettled(driverPromise);

  const resolvedDriverInfo = [];
  for (let driver of driverPromiseStatus) {
    if (driver.status === 'fulfilled') {
      resolvedDriverInfo.push(driver);
    }
  }
  console.log(resolvedDriverInfo);

  const vehicleIdArray = resolvedDriverInfo.map(object => {
    return object.value.vehicleID;
  })
  console.log(vehicleIdArray);

  const vehiclePromise = [];
  for (let array of vehicleIdArray) {
    const promise = [];

    for(let id of array) {
      promise.push(getVehicle(id));
    }
    vehiclePromise.push(promise);
  }
  console.log(vehiclePromise);

  const vehicleInfo = [];
  for (let array of vehiclePromise) {
    vehicleInfo.push(await Promise.allSettled(array))
  }
  console.log(vehicleInfo);

  const vehicle = [];
  for (let array of vehicleInfo) {
    vehicle.push(createVehicle(array));
  }

  for (let i = 0; i < singleDriverIdArray.length; i++) {
    const driverReport = {};
    
    if (driverPromiseStatus[i].status === 'fulfilled') {
      driverReport['fullName'] = driverPromiseStatus[i].value.name;
      driverReport['phone'] = driverPromiseStatus[i].value.phone;
    }
    
    driverReport['id'] = singleDriverIdArray[i];
    driverReport['vehicles'] = vehicle[i] || [];
    driverReport['noOfTrips'] = 0;
    driverReport['noOfCashTrips'] = 0;
    driverReport['noOfNonCashTrips'] = 0;
    driverReport['trips'] = [],
    driverReport['totalAmountEarned'] = 0,
    driverReport['totalCashAmount'] = 0,
    driverReport['totalNonCashAmount'] = 0
    for (let object of response) {
      if (singleDriverIdArray[i] === object.driverID) {
        driverReport.noOfTrips = ++driverReport.noOfTrips;
        driverReport.trips.push(createUser(object));
        const billedAmount = driverReport.totalAmountEarned + parseFloat(String(object.billedAmount).replace(/,/g, ''));
        driverReport.totalAmountEarned = Number(billedAmount.toFixed(2));

        if (object.isCash === true) {
          driverReport.noOfCashTrips = ++driverReport.noOfCashTrips;
          const billedAmount = driverReport.totalCashAmount + parseFloat(String(object.billedAmount).replace(/,/g, ''));
          driverReport.totalCashAmount = Number(billedAmount.toFixed(2));
        } else {
          driverReport.noOfNonCashTrips = ++driverReport.noOfNonCashTrips;
          const billedAmount = driverReport.totalNonCashAmount + parseFloat(String(object.billedAmount).replace(/,/g, ''));
          driverReport.totalNonCashAmount = Number(billedAmount.toFixed(2));
        }
      }
    }
    output.push(driverReport);
  }
  
  return output;
}
driverReport()

module.exports = driverReport;

