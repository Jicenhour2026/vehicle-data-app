
import axios from "axios";

/* ---------------- VIN Decode ---------------- */
async function decodeVIN(vin) {
  const res = await axios.get(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
  );
  const v = res.data.Results[0];

  return {
    year: v.ModelYear,
    make: v.Make,
    model: v.Model,
    engine: v.EngineModel || null
  };
}

/* -------- Maintenance Schedule API -------- */
async function getMaintenanceSchedule(vehicle) {
  const res = await axios.get(
    "https://api.vehicledatabases.com/maintenance",
    {
      headers: { "X-API-Key": process.env.MAINTENANCE_API_KEY },
      params: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model
      }
    }
  );

  return res.data.schedules.map(s => ({
    interval: `${s.interval_miles} miles`,
    services: s.services
  }));
}

/* -------- Tire & Wheel Spec API (NEW) -------- */
async function getTireSpecs(vehicle) {
  const res = await axios.get(
    "https://api.411vehicledata.com/v1/tires",
    {
      headers: { "X-API-Key": process.env.TIRE_API_KEY },
      params: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model
      }
    }
  );

  return {
    front: res.data.front_tire,
    rear: res.data.rear_tire,
    wheelDiameter: res.data.wheel_diameter || null
  };
}

/* ---------------- Main Handler ---------------- */
export default async function handler(req, res) {
  try {
    const { vin } = req.query;
    if (!vin) {
      return res.status(400).json({ error: "VIN required" });
    }

    const vehicle = await decodeVIN(vin);

    const [maintenance, tires] = await Promise.all([
      getMaintenanceSchedule(vehicle),
      getTireSpecs(vehicle)
    ]);

    res.status(200).json({
      vehicle,
      maintenance,
      tires
    });

  } catch (err) {
    res.status(500).json({
      error: "Vehicle lookup failed",
      detail: err.message
    });
  }
}
