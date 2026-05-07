
import axios from "axios";

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

async function getMaintenanceSchedule(vehicle) {
  const response = await axios.get(
    "https://api.vehicledatabases.com/maintenance",
    {
      headers: {
        "X-API-Key": process.env.MAINTENANCE_API_KEY
      },
      params: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model
      }
    }
  );

  return response.data.schedules.map(item => ({
    interval: `${item.interval_miles} miles`,
    services: item.services
  }));
}

export default async function handler(req, res) {
  try {
    const { vin } = req.query;
    if (!vin) {
      return res.status(400).json({ error: "VIN required" });
    }

    const vehicle = await decodeVIN(vin);
    const maintenance = await getMaintenanceSchedule(vehicle);

    res.status(200).json({
      vehicle,
      maintenance
    });

  } catch (err) {
    res.status(500).json({
      error: "Maintenance lookup failed",
      detail: err.message
    });
  }
}
