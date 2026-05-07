
export default async function handler(req, res) {
  try {
    const { vin } = req.query;

    if (!vin) {
      return res.status(400).json({
        error: "VIN required"
      });
    }

    // ✅ Built-in fetch (works on Vercel)
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    );

    const data = await response.json();
    const v = data.Results[0];

    res.status(200).json({
      vehicle: {
        vin,
        year: v.ModelYear,
        make: v.Make,
        model: v.Model,
        bodyClass: v.BodyClass,
        engine: v.EngineModel || "Unknown"
      }
    });

  } catch (err) {
    res.status(500).json({
      error: "VIN decode failed",
      detail: err.message
    });
  }
}
