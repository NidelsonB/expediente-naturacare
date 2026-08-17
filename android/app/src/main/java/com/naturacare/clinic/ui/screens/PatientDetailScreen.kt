package com.naturacare.clinic.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.Print
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.naturacare.clinic.data.Patient
import com.naturacare.clinic.data.PatientDraft
import com.naturacare.clinic.data.Visit
import com.naturacare.clinic.ui.components.ClinicCard
import com.naturacare.clinic.ui.components.StatusChip
import com.naturacare.clinic.ui.components.formatClinicalDate
import com.naturacare.clinic.ui.documents.printCertificate
import com.naturacare.clinic.ui.documents.printPrescription

@Composable
fun PatientDetailScreen(
    patient: Patient?,
    visits: List<Visit>,
    loading: Boolean,
    onLoadVisits: () -> Unit,
    onBack: () -> Unit,
    onNewVisit: () -> Unit,
    onUpdatePatient: (PatientDraft, () -> Unit) -> Unit,
    onDeletePatient: () -> Unit,
    onUpdateRecipe: (String, String) -> Unit,
) {
    LaunchedEffect(patient?.id) { if (patient != null) onLoadVisits() }
    if (patient == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Expediente no ubicado", style = MaterialTheme.typography.headlineSmall)
                OutlinedButton(onClick = onBack) { Text("Volver a expedientes") }
            }
        }
        return
    }

    var editingPatient by remember { mutableStateOf(false) }
    var certificateOpen by remember { mutableStateOf(false) }
    var deleteConfirmationOpen by remember { mutableStateOf(false) }
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth < 600.dp
        val split = maxWidth >= 900.dp
        if (split) {
            Row(Modifier.fillMaxSize().padding(24.dp), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                PatientSummaryPanel(
                    patient,
                    onBack,
                    onNewVisit,
                    { editingPatient = true },
                    { deleteConfirmationOpen = true },
                    { certificateOpen = true },
                    Modifier.width(300.dp).fillMaxHeight(),
                )
                VisitHistory(patient, visits, loading, onUpdateRecipe, false, Modifier.weight(1f).fillMaxHeight())
            }
        } else if (compact) {
            Column(Modifier.fillMaxSize().padding(12.dp)) {
                MobilePatientSummary(
                    patient = patient,
                    onBack = onBack,
                    onNewVisit = onNewVisit,
                    onEdit = { editingPatient = true },
                    onDelete = { deleteConfirmationOpen = true },
                    onCertificate = { certificateOpen = true },
                )
                Spacer(Modifier.height(12.dp))
                VisitHistory(patient, visits, loading, onUpdateRecipe, true, Modifier.weight(1f))
            }
        } else {
            Column(Modifier.fillMaxSize().padding(16.dp)) {
                PatientSummaryPanel(
                    patient,
                    onBack,
                    onNewVisit,
                    { editingPatient = true },
                    { deleteConfirmationOpen = true },
                    { certificateOpen = true },
                    Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(16.dp))
                VisitHistory(patient, visits, loading, onUpdateRecipe, false, Modifier.weight(1f))
            }
        }
    }

    if (editingPatient) {
        EditPatientDialog(
            patient = patient,
            loading = loading,
            onDismiss = { editingPatient = false },
            onSave = { draft -> onUpdatePatient(draft) { editingPatient = false } },
        )
    }
    if (certificateOpen) {
        CertificateDialog(patient = patient, onDismiss = { certificateOpen = false })
    }
    if (deleteConfirmationOpen) {
        AlertDialog(
            onDismissRequest = { if (!loading) deleteConfirmationOpen = false },
            title = { Text("Eliminar paciente") },
            text = { Text("Eliminarás permanentemente el expediente de ${patient.name} y todas sus consultas. Esta acción no se puede deshacer.") },
            confirmButton = {
                Button(
                    onClick = onDeletePatient,
                    enabled = !loading,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                ) { Text(if (loading) "Eliminando…" else "Eliminar paciente") }
            },
            dismissButton = {
                OutlinedButton(onClick = { deleteConfirmationOpen = false }, enabled = !loading) { Text("Cancelar") }
            },
        )
    }
}

@Composable
private fun MobilePatientSummary(
    patient: Patient,
    onBack: () -> Unit,
    onNewVisit: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onCertificate: () -> Unit,
) {
    ClinicCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.Outlined.ArrowBack, "Regresar") }
                Column(Modifier.weight(1f)) {
                    Text(patient.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Text("${patient.age} años · ${patient.gender} · DUI ${patient.dui ?: "No aplica"}", style = MaterialTheme.typography.bodySmall)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatusChip(patient.branch, MaterialTheme.colorScheme.secondaryContainer, MaterialTheme.colorScheme.onSecondaryContainer)
                if (patient.chronicIllness.isNotBlank()) {
                    StatusChip(patient.chronicIllness, MaterialTheme.colorScheme.error, Color.White)
                }
            }
            if (patient.medicalHistory.isNotBlank()) {
                Text(patient.medicalHistory, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2)
            }
            Button(onClick = onNewVisit, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                Icon(Icons.Outlined.Add, null)
                Spacer(Modifier.width(6.dp))
                Text("Nueva consulta")
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = onEdit, modifier = Modifier.weight(1f).height(48.dp)) {
                    Icon(Icons.Outlined.Edit, null)
                    Spacer(Modifier.width(5.dp))
                    Text("Editar")
                }
                OutlinedButton(
                    onClick = onDelete,
                    modifier = Modifier.weight(1f).height(48.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.error),
                ) {
                    Icon(Icons.Outlined.Delete, null)
                    Spacer(Modifier.width(5.dp))
                    Text("Eliminar")
                }
            }
            OutlinedButton(onClick = onCertificate, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                    Icon(Icons.Outlined.Description, null)
                    Spacer(Modifier.width(5.dp))
                    Text("Constancia")
            }
        }
    }
}

@Composable
private fun PatientSummaryPanel(
    patient: Patient,
    onBack: () -> Unit,
    onNewVisit: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onCertificate: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ClinicCard(modifier) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            IconButton(onClick = onBack) { Icon(Icons.Outlined.ArrowBack, "Regresar") }
            Surface(color = MaterialTheme.colorScheme.primaryContainer, shape = MaterialTheme.shapes.medium) {
                Text(
                    patient.name.take(2).uppercase(),
                    modifier = Modifier.padding(14.dp),
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    fontWeight = FontWeight.Bold,
                )
            }
            Text(patient.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.SemiBold)
            Text("${patient.age} años · ${patient.gender}")
            Text("DUI ${patient.dui ?: "No aplica"}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(patient.address, style = MaterialTheme.typography.bodyMedium)
            StatusChip(
                patient.branch,
                MaterialTheme.colorScheme.secondaryContainer,
                MaterialTheme.colorScheme.onSecondaryContainer,
            )
            if (patient.chronicIllness.isNotBlank()) {
                StatusChip(patient.chronicIllness, MaterialTheme.colorScheme.error, Color.White)
            }
            Text("Antecedentes clínicos", style = MaterialTheme.typography.labelLarge)
            Text(patient.medicalHistory.ifBlank { "Sin antecedentes registrados." }, style = MaterialTheme.typography.bodyMedium)
            Button(onClick = onNewVisit, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                Icon(Icons.Outlined.Add, null)
                Spacer(Modifier.width(6.dp))
                Text("Nueva consulta")
            }
            OutlinedButton(onClick = onEdit, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                Icon(Icons.Outlined.Edit, null)
                Spacer(Modifier.width(6.dp))
                Text("Editar paciente")
            }
            OutlinedButton(
                onClick = onDelete,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.error),
            ) {
                Icon(Icons.Outlined.Delete, null)
                Spacer(Modifier.width(6.dp))
                Text("Eliminar paciente")
            }
            OutlinedButton(onClick = onCertificate, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                Icon(Icons.Outlined.Description, null)
                Spacer(Modifier.width(6.dp))
                Text("Constancia médica")
            }
        }
    }
}

@Composable
private fun VisitHistory(
    patient: Patient,
    visits: List<Visit>,
    loading: Boolean,
    onUpdateRecipe: (String, String) -> Unit,
    compact: Boolean,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val printDates = remember { mutableStateMapOf<String, String>() }
    var editingVisit by remember { mutableStateOf<Visit?>(null) }

    Column(modifier) {
        Text("Historial de consultas", style = if (compact) MaterialTheme.typography.titleLarge else MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.SemiBold)
        if (!compact) Text("Registro cronológico de atenciones médicas", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(14.dp))
        if (visits.isEmpty() && !loading) {
            ClinicCard(Modifier.fillMaxWidth()) {
                Text("No hay consultas registradas.", modifier = Modifier.padding(24.dp))
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(visits.sortedByDescending(Visit::date), key = Visit::id) { visit ->
                    ClinicCard(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            if (compact) Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(formatClinicalDate(visit.date), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
                                OutlinedButton(onClick = { editingVisit = visit }) {
                                    Icon(Icons.Outlined.Edit, null)
                                    Spacer(Modifier.width(5.dp))
                                    Text("Editar receta")
                                }
                            } else Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Column {
                                    Text(formatClinicalDate(visit.date), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
                                    Text("Consulta", style = MaterialTheme.typography.labelMedium)
                                }
                                Row {
                                    OutlinedButton(onClick = { editingVisit = visit }) {
                                        Icon(Icons.Outlined.Edit, null)
                                        Spacer(Modifier.width(5.dp))
                                        Text("Editar receta")
                                    }
                                }
                            }
                            Text("Motivo", style = MaterialTheme.typography.labelLarge)
                            visit.notes.forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                            if (compact) Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Column {
                                    Text("Tratamiento", style = MaterialTheme.typography.labelLarge)
                                    Text(visit.treatment.ifBlank { "Sin tratamiento registrado" })
                                }
                                Column {
                                    Text("Receta", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                                    Text(visit.medications.ifBlank { "Sin indicaciones registradas" })
                                }
                            } else Row(horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                                Column(Modifier.weight(1f)) {
                                    Text("Tratamiento", style = MaterialTheme.typography.labelLarge)
                                    Text(visit.treatment.ifBlank { "Sin tratamiento registrado" })
                                }
                                Column(Modifier.weight(1f)) {
                                    Text("Receta", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                                    Text(visit.medications.ifBlank { "Sin indicaciones registradas" })
                                }
                            }
                            if (compact) Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(
                                    value = printDates[visit.id].orEmpty(),
                                    onValueChange = { printDates[visit.id] = applyDateMask(it) },
                                    label = { Text("Fecha de receta") },
                                    placeholder = { Text("DD/MM/AAAA") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                )
                                Button(
                                    onClick = { printPrescription(context, patient, visit, printDates[visit.id].orEmpty()) },
                                    enabled = !printDates[visit.id].isNullOrBlank() && visit.medications.isNotBlank(),
                                    modifier = Modifier.fillMaxWidth().height(48.dp),
                                ) {
                                    Icon(Icons.Outlined.Print, null)
                                    Spacer(Modifier.width(5.dp))
                                    Text("Imprimir receta")
                                }
                            } else Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                OutlinedTextField(
                                    value = printDates[visit.id].orEmpty(),
                                    onValueChange = { printDates[visit.id] = applyDateMask(it) },
                                    label = { Text("Fecha de receta") },
                                    placeholder = { Text("DD/MM/AAAA") },
                                    singleLine = true,
                                    modifier = Modifier.width(190.dp),
                                )
                                Button(
                                    onClick = { printPrescription(context, patient, visit, printDates[visit.id].orEmpty()) },
                                    enabled = !printDates[visit.id].isNullOrBlank() && visit.medications.isNotBlank(),
                                ) {
                                    Icon(Icons.Outlined.Print, null)
                                    Spacer(Modifier.width(5.dp))
                                    Text("Imprimir receta")
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    editingVisit?.let { visit ->
        var medication by remember(visit.id) { mutableStateOf(visit.medications) }
        AlertDialog(
            onDismissRequest = { editingVisit = null },
            title = { Text("Editar receta") },
            text = {
                OutlinedTextField(
                    value = medication,
                    onValueChange = { medication = it },
                    label = { Text("Receta e indicaciones") },
                    minLines = 6,
                    modifier = Modifier.fillMaxWidth(),
                )
            },
            confirmButton = {
                Button(
                    onClick = { onUpdateRecipe(visit.id, medication); editingVisit = null },
                    enabled = medication.isNotBlank(),
                ) { Text("Guardar receta") }
            },
            dismissButton = { OutlinedButton(onClick = { editingVisit = null }) { Text("Cancelar") } },
        )
    }
}

@Composable
private fun EditPatientDialog(
    patient: Patient,
    loading: Boolean,
    onDismiss: () -> Unit,
    onSave: (PatientDraft) -> Unit,
) {
    var draft by remember(patient.id) {
        mutableStateOf(
            PatientDraft(
                name = patient.name,
                dui = patient.dui.orEmpty(),
                duiNotApplicable = patient.dui.isNullOrBlank(),
                age = patient.age.toString(),
                gender = patient.gender,
                address = patient.address,
                chronicIllness = patient.chronicIllness,
                medicalHistory = patient.medicalHistory,
                branch = patient.branch,
            )
        )
    }
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxWidth(.94f).fillMaxHeight(.92f), shape = MaterialTheme.shapes.large) {
            BoxWithConstraints {
                val compact = maxWidth < 600.dp
                Column(Modifier.padding(if (compact) 14.dp else 20.dp)) {
                Text("Editar información del paciente", style = MaterialTheme.typography.headlineSmall)
                Spacer(Modifier.height(14.dp))
                Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
                    PatientFields(draft, { draft = it }, includeClinical = true)
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.then(if (compact) Modifier.weight(1f) else Modifier),
                    ) { Text("Cancelar") }
                    Spacer(Modifier.width(10.dp))
                    Button(
                        onClick = { onSave(draft) },
                        enabled = !loading,
                        modifier = Modifier.then(if (compact) Modifier.weight(1f) else Modifier),
                    ) {
                        Icon(Icons.Outlined.Save, null)
                        Spacer(Modifier.width(5.dp))
                        Text(if (compact) "Guardar" else "Guardar cambios")
                    }
                }
            }
            }
        }
    }
}

@Composable
private fun CertificateDialog(patient: Patient, onDismiss: () -> Unit) {
    val context = LocalContext.current
    var text by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("") }
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxWidth(.92f).fillMaxHeight(.88f), shape = MaterialTheme.shapes.large) {
            BoxWithConstraints(Modifier.padding(24.dp)) {
                val split = maxWidth >= 800.dp
                val compact = maxWidth < 600.dp
                Column {
                    Text("Constancia médica", style = MaterialTheme.typography.headlineSmall)
                    Spacer(Modifier.height(16.dp))
                    if (split) {
                        Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                            CertificateEditor(text, date, { text = it }, { date = applyDateMask(it) }, Modifier.weight(1f))
                            CertificatePreview(patient, text, date, Modifier.weight(1f).verticalScroll(rememberScrollState()))
                        }
                    } else {
                        Column(Modifier.weight(1f).verticalScroll(rememberScrollState())) {
                            CertificateEditor(text, date, { text = it }, { date = applyDateMask(it) })
                            Spacer(Modifier.height(14.dp))
                            CertificatePreview(patient, text, date)
                        }
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier.then(if (compact) Modifier.weight(1f) else Modifier),
                        ) { Text("Cerrar") }
                        Spacer(Modifier.width(10.dp))
                        Button(
                            onClick = { printCertificate(context, patient, text, date) },
                            enabled = text.isNotBlank() && date.isNotBlank(),
                            modifier = Modifier.then(if (compact) Modifier.weight(1f) else Modifier),
                        ) {
                            Icon(Icons.Outlined.Print, null)
                            Spacer(Modifier.width(5.dp))
                            Text(if (compact) "Imprimir" else "Imprimir constancia")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CertificateEditor(
    text: String,
    date: String,
    onText: (String) -> Unit,
    onDate: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(value = text, onValueChange = onText, label = { Text("Texto de constancia") }, minLines = 10, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = date, onValueChange = onDate, label = { Text("Fecha de constancia") }, placeholder = { Text("DD/MM/AAAA") }, singleLine = true)
    }
}

@Composable
private fun CertificatePreview(patient: Patient, text: String, date: String, modifier: Modifier = Modifier) {
    ClinicCard(modifier.fillMaxWidth()) {
        Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("NaturaCare", style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
            Text("ND. Selvin Lopez · ${date.ifBlank { "Fecha pendiente" }}", style = MaterialTheme.typography.labelMedium)
            Text(text.ifBlank { "Escribe el contenido de la constancia para previsualizarlo." }, style = MaterialTheme.typography.bodyLarge)
            Spacer(Modifier.height(100.dp))
            Text("Firma y sello médico", modifier = Modifier.align(Alignment.End))
        }
    }
}
