export class PayerCollectorSameUserException extends Error {
  constructor(message?: string) {
    super(
      message ||
        "No podés suscribirte con la misma cuenta de MercadoPago que recibe los pagos. Usá un email distinto (otra cuenta de MercadoPago)."
    );
    this.name = "PayerCollectorSameUserException";
  }
}
