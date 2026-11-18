import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactStellarScheme } from "@x402/stellar/exact/server";

const PORT = 3001;
const NETWORK = "stellar:testnet";
const PAY_TO = process.env.MI_PUBLICA;
if (!PAY_TO) throw new Error("Falta MI_PUBLICA en .env: es la cuenta que recibe el USDC.");

const facilitator = new HTTPFacilitatorClient({ url: "https://x402.org/facilitator" });
const resourceServer = new x402ResourceServer(facilitator).register(NETWORK, new ExactStellarScheme());

const app = express();

// Sin pago responde 402. Con el pago liquidado, sigue al handler.
app.use(
  paymentMiddleware(
    {
      "GET /dato": {
        accepts: {
          scheme: "exact",
          price: "$0.01",
          network: NETWORK,
          payTo: PAY_TO,
        },
        description: "El dato de la sesión",
      },
    },
    resourceServer,
  ),
);

app.get("/dato", (_, res) =>
  res.json({ dato: "El código HTTP 402 significa Payment Required", gratis: false }),
);

app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}/dato (cobra $0.01 USDC)`));
