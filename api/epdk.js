export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const https = await import("https");

  const body = JSON.stringify({
    lisansNo: "",
    sarjIstasyonuAdi: "",
    sarjIstasyonuNo: "",
    markaAdi: "",
    yesilSarjIstasyonuMu: "",
    hizmetSekli: ""
  });

  const options = {
    hostname: "apigateway.epdk.gov.tr",
    path: "/sarjIstasyonlari/",
    method: "GET",
    headers: {
      "Accept": "application/json,text/plain,*/*",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "User-Agent": "MolaVolt/1.0"
    },
    timeout: 30000
  };

  const result = await new Promise((resolve) => {
    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", chunk => {
        data += chunk;
      });

      response.on("end", () => {
        resolve({
          statusCode: response.statusCode || 500,
          body: data
        });
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error("EPDK timeout"));
    });

    request.on("error", (error) => {
      resolve({
        statusCode: 502,
        body: JSON.stringify({
          ok: false,
          error: "EPDK bağlantı hatası",
          detail: error.message
        })
      });
    });

    request.write(body);
    request.end();
  });

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(result.statusCode).send(result.body);
}
