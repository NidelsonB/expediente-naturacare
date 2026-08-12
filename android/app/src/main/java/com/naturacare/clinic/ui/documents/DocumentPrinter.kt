package com.naturacare.clinic.ui.documents

import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.WebView
import android.webkit.WebViewClient
import com.naturacare.clinic.data.Patient
import com.naturacare.clinic.data.Visit

fun printPrescription(context: Context, patient: Patient, visit: Visit, printDate: String) {
    val body = """
        <div class="label">Receta / medicamentos</div>
        <div class="content">${escape(visit.medications).replace("\n", "<br>")}</div>
        <div class="appointment"><strong>Recordatorio de cita</strong><br>
        Su próxima cita queda programada para ____________________. Confirme su asistencia un día antes al 2220-7977.</div>
    """.trimIndent()
    printHtml(context, "NaturaCare_Receta_${patient.name}", documentHtml(patient, printDate, body))
}

fun printCertificate(context: Context, patient: Patient, text: String, printDate: String) {
    val body = "<div class=\"content\">${escape(text).replace("\n", "<br>")}</div>"
    printHtml(context, "NaturaCare_Constancia_${patient.name}", documentHtml(patient, printDate, body))
}

private fun printHtml(context: Context, title: String, html: String) {
    val webView = WebView(context)
    webView.webViewClient = object : WebViewClient() {
        override fun onPageFinished(view: WebView, url: String?) {
            val manager = context.getSystemService(Context.PRINT_SERVICE) as PrintManager
            manager.print(
                title,
                view.createPrintDocumentAdapter(title),
                PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build(),
            )
        }
    }
    webView.loadDataWithBaseURL(null, html, "text/HTML", "UTF-8", null)
}

private fun documentHtml(patient: Patient, printDate: String, body: String) = """
    <!doctype html><html><head><meta charset="utf-8"><style>
      @page { size: A4; margin: 15mm; }
      body { font-family: sans-serif; color: #191c1d; margin: 0; line-height: 1.5; }
      header { display: flex; justify-content: space-between; align-items: start; }
      h1 { color: #005344; font-size: 38px; margin: 0; }
      .meta { color: #3e4945; font-size: 11px; text-transform: uppercase; }
      .rule { height: 5px; background: #006d5b; margin: 24px 0; }
      h2 { font-size: 20px; margin: 0 0 24px; }
      .label { color: #005344; font-size: 12px; font-weight: bold; text-transform: uppercase; }
      .content { min-height: 145mm; margin-top: 12px; font-size: 16px; }
      .appointment { border: 2px solid #81d6c0; padding: 14px; margin-top: 20px; }
      footer { display: flex; justify-content: space-between; margin-top: 50px; }
      .signature { width: 42%; border-top: 1px solid #191c1d; text-align: center; padding-top: 8px; }
    </style></head><body>
      <header><div><h1>NaturaCare</h1><div class="meta">Medicina Natural, Biológica y Regenerativa<br>Tel. 2220-7977<br>Sucursal ${escape(patient.branch)}</div></div>
      <div><strong>ND. Selvin Lopez</strong><br><span class="meta">Fecha: ${escape(printDate)}</span></div></header>
      <div class="rule"></div>$body
      <footer><div>Próxima cita: ____________________</div><div class="signature">Firma y sello médico<br>ND. Selvin Lopez</div></footer>
    </body></html>
""".trimIndent()

private fun escape(value: String) = value
    .replace("&", "&amp;")
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace("\"", "&quot;")
    .replace("'", "&#39;")
