
export default async function handler(req, res) {
  try {
    const { vin } = req.query;

    if (!vin) {
      return res.status(400).json({
        error: "VIN required"
      });
    }

    // ✅ VIN decode (verified working)
    const vinRes = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    );
    const vinData = await vinRes.json();
    const v = vinData.Results[0];

    const vehicle = {
      vin,
      year: v.ModelYear,
      make: v.Make,
      model: v.Model,
      bodyClass: v.BodyClass,
      engine: v.EngineModel || "Unknown"
    };

    // ✅ SAFE maintenance lookup (mock now, real later)
    let maintenance = null;
    try {
      // This is where a real API will go later.
      // For now, we return guaranteed-safe data.
      maintenance = [
        {
          interval: "5,000 miles",
          services: ["Oil change", "Tire rotation"]
        },
        {
          interval: "30,000 miles",
          services: ["Brake inspection", "Cabin air filter"]
        }
      ];
