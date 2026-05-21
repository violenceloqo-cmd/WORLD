import type { Logger } from "./logger.js";

export type TelegramConfig = {
  botToken: string | null;
  chatId: string | null;
  verbose: boolean;
};

export class TelegramNotifier {
  constructor(
    private readonly cfg: TelegramConfig,
    private readonly log: Logger,
  ) {}

  get enabled(): boolean {
    return Boolean(this.cfg.botToken && this.cfg.chatId);
  }

  /**
   * Routine status (per-cycle summary, "below threshold" no-ops).
   * Suppressed when TELEGRAM_VERBOSE=false.
   */
  async info(text: string): Promise<void> {
    if (!this.cfg.verbose) return;
    await this.send(text, false);
  }

  /** Successful claim + transfer. Always delivered. */
  async success(text: string): Promise<void> {
    await this.send(text, false);
  }

  /** Failure. Always delivered and pinned with a loud header. */
  async error(text: string): Promise<void> {
    await this.send(`⚠️ <b>fee-claimer error</b>\n${text}`, true);
  }

  private async send(text: string, isError: boolean): Promise<void> {
    if (!this.enabled) {
      this.log.debug({ telegram: false }, "telegram disabled, skipping");
      return;
    }
    try {
      const url = `https://api.telegram.org/bot${this.cfg.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.cfg.chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        this.log.warn(
          { status: res.status, body },
          "telegram sendMessage failed",
        );
      }
    } catch (err) {
      // Never let notification failure kill the claim loop.
      this.log.warn({ err, isError }, "telegram send threw");
    }
  }
}
