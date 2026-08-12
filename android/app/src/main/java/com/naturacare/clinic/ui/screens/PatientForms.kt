package com.naturacare.clinic.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import com.naturacare.clinic.data.PatientDraft
import com.naturacare.clinic.data.VisitDraft
import com.naturacare.clinic.ui.components.ClinicCard
import com.naturacare.clinic.ui.components.SectionHeader

@Composable
fun NewPatientScreen(
    loading: Boolean,
    onCancel: () -> Unit,
    onSave: (PatientDraft, VisitDraft) -> Unit,
) {
    var patient by remember { mutableStateOf(PatientDraft()) }
    var visit by remember { mutableStateOf(VisitDraft()) }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth < 600.dp
        val split = maxWidth >= 900.dp
        Column(Modifier.fillMaxSize().imePadding()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = if (compact) 8.dp else 24.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onCancel) { Icon(Icons.Outlined.ArrowBack, "Regresar") }
                SectionHeader("Nuevo registro de paciente", "Consulta inicial", Modifier.weight(1f))
                if (!compact) {
                    Text("Campos obligatorios (*)", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.error)
                }
            }
            if (split) {
                Row(Modifier.weight(1f).padding(horizontal = 24.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column(
                        Modifier.weight(1.25f).verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        PatientFields(patient, { patient = it }, includeClinical = true)
                        VisitFields(visit, { visit = it })
                        Spacer(Modifier.height(8.dp))
                    }
                    Column(Modifier.weight(.75f).verticalScroll(rememberScrollState())) {
                        PrescriptionPreview(patient.name, patient.branch, visit.medications, visit.printDate)
                    }
                }
            } else {
                Column(
                    Modifier.weight(1f).padding(horizontal = 16.dp).verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    PatientFields(patient, { patient = it }, includeClinical = true)
                    VisitFields(visit, { visit = it })
                    PrescriptionPreview(patient.name, patient.branch, visit.medications, visit.printDate)
                }
            }
            FormActions(loading, onCancel) { onSave(patient, visit) }
        }
    }
}

@Composable
fun SecretaryFormScreen(
    loading: Boolean,
    onSave: (PatientDraft) -> Unit,
    onToday: () -> Unit,
) {
    var patient by remember { mutableStateOf(PatientDraft()) }
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth < 600.dp
        Column(Modifier.fillMaxSize().padding(if (compact) 16.dp else 24.dp).imePadding()) {
            if (compact) {
                Text("Registro de secretaría", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold)
                Text(
                    "Alta administrativa · Pendiente de doctor",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(12.dp))
                OutlinedButton(onClick = onToday, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                    Text("Ver pacientes de hoy")
                }
            } else {
                SectionHeader(
                    "Registro de secretaría",
                    "Alta administrativa. El paciente quedará pendiente de doctor.",
                    action = { OutlinedButton(onClick = onToday) { Text("Ver pacientes de hoy") } },
                )
            }
            Spacer(Modifier.height(if (compact) 12.dp else 20.dp))
            Column(
                Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Column(Modifier.fillMaxWidth(if (compact) 1f else .9f)) {
                    PatientFields(patient, { patient = it }, includeClinical = false)
                }
            }
            Button(
                onClick = { onSave(patient) },
                enabled = !loading,
                modifier = Modifier.fillMaxWidth(if (compact) 1f else .4f).height(48.dp).align(Alignment.End),
            ) {
                Icon(Icons.Outlined.Save, null)
                Spacer(Modifier.width(8.dp))
                Text(if (loading) "Guardando…" else "Registrar paciente")
            }
        }
    }
}

@Composable
fun PatientFields(
    patient: PatientDraft,
    onChange: (PatientDraft) -> Unit,
    includeClinical: Boolean,
) {
    ClinicCard(Modifier.fillMaxWidth()) {
        BoxWithConstraints {
        val compact = maxWidth < 520.dp
        Column(Modifier.padding(if (compact) 16.dp else 20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Perfil del paciente", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
            OutlinedTextField(
                value = patient.name,
                onValueChange = { onChange(patient.copy(name = it)) },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Nombre completo *") },
                singleLine = true,
            )
            if (compact) Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = if (patient.duiNotApplicable) "" else patient.dui,
                    onValueChange = { onChange(patient.copy(dui = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("DUI") },
                    placeholder = { Text("00000000-0") },
                    enabled = !patient.duiNotApplicable,
                    singleLine = true,
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = patient.duiNotApplicable,
                        onCheckedChange = { onChange(patient.copy(duiNotApplicable = it, dui = if (it) "" else patient.dui)) },
                    )
                    Text("DUI no aplica", style = MaterialTheme.typography.labelLarge, modifier = Modifier.weight(1f))
                    OutlinedTextField(
                        value = patient.age,
                        onValueChange = { onChange(patient.copy(age = it.filter(Char::isDigit).take(3))) },
                        modifier = Modifier.width(110.dp),
                        label = { Text("Edad *") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                    )
                }
            } else Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = if (patient.duiNotApplicable) "" else patient.dui,
                    onValueChange = { onChange(patient.copy(dui = it)) },
                    modifier = Modifier.weight(1f),
                    label = { Text("DUI") },
                    placeholder = { Text("00000000-0") },
                    enabled = !patient.duiNotApplicable,
                    singleLine = true,
                )
                Checkbox(
                    checked = patient.duiNotApplicable,
                    onCheckedChange = { onChange(patient.copy(duiNotApplicable = it, dui = if (it) "" else patient.dui)) },
                )
                Text("No aplica", style = MaterialTheme.typography.labelLarge)
                OutlinedTextField(
                    value = patient.age,
                    onValueChange = { onChange(patient.copy(age = it.filter(Char::isDigit).take(3))) },
                    modifier = Modifier.width(110.dp),
                    label = { Text("Edad *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                )
            }
            Text("Género", style = MaterialTheme.typography.labelLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Masculino", "Femenino", "Otro").forEach { gender ->
                    FilterChip(
                        selected = patient.gender == gender,
                        onClick = { onChange(patient.copy(gender = gender)) },
                        modifier = if (compact) Modifier.weight(1f) else Modifier,
                        label = { Text(gender) },
                    )
                }
            }
            Text("Sucursal", style = MaterialTheme.typography.labelLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("San Marcos", "San Miguel").forEach { branch ->
                    FilterChip(
                        selected = patient.branch == branch,
                        onClick = { onChange(patient.copy(branch = branch)) },
                        modifier = if (compact) Modifier.weight(1f) else Modifier,
                        label = { Text(branch) },
                    )
                }
            }
            OutlinedTextField(
                value = patient.address,
                onValueChange = { onChange(patient.copy(address = it)) },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Dirección de residencia *") },
                minLines = 2,
            )
            if (includeClinical) {
                OutlinedTextField(
                    value = patient.chronicIllness,
                    onValueChange = { onChange(patient.copy(chronicIllness = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Enfermedad crónica") },
                    supportingText = { Text("Ejemplo: Hipertensión, diabetes tipo II") },
                )
                OutlinedTextField(
                    value = patient.medicalHistory,
                    onValueChange = { onChange(patient.copy(medicalHistory = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Antecedentes clínicos") },
                    minLines = 3,
                )
            }
        }
        }
    }
}

@Composable
fun VisitFields(visit: VisitDraft, onChange: (VisitDraft) -> Unit) {
    ClinicCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Consulta inicial", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
            Text("Motivo de consulta *", style = MaterialTheme.typography.labelLarge)
            visit.notes.forEachIndexed { index, note ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    OutlinedTextField(
                        value = note,
                        onValueChange = { value ->
                            onChange(visit.copy(notes = visit.notes.toMutableList().apply { this[index] = value }))
                        },
                        modifier = Modifier.weight(1f),
                        label = { Text("Punto ${index + 1}") },
                        singleLine = true,
                    )
                    if (visit.notes.size > 1) {
                        IconButton(onClick = { onChange(visit.copy(notes = visit.notes.filterIndexed { i, _ -> i != index })) }) {
                            Icon(Icons.Outlined.Delete, "Eliminar punto")
                        }
                    }
                }
            }
            OutlinedButton(onClick = { onChange(visit.copy(notes = visit.notes + "")) }) {
                Icon(Icons.Outlined.Add, null)
                Spacer(Modifier.width(6.dp))
                Text("Agregar punto")
            }
            OutlinedTextField(
                value = visit.treatment,
                onValueChange = { onChange(visit.copy(treatment = it)) },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Observaciones y tratamiento") },
                minLines = 4,
            )
            OutlinedTextField(
                value = visit.medications,
                onValueChange = { onChange(visit.copy(medications = it)) },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Receta e indicaciones") },
                minLines = 4,
            )
            OutlinedTextField(
                value = visit.printDate,
                onValueChange = { onChange(visit.copy(printDate = applyDateMask(it))) },
                label = { Text("Fecha para impresión") },
                placeholder = { Text("DD/MM/AAAA") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
            )
        }
    }
}

@Composable
private fun FormActions(loading: Boolean, onCancel: () -> Unit, onSave: () -> Unit) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val compact = maxWidth < 520.dp
        Row(
            Modifier.fillMaxWidth().padding(12.dp),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedButton(onClick = onCancel, modifier = if (compact) Modifier.weight(.8f).height(48.dp) else Modifier.height(48.dp)) { Text("Cancelar") }
            Spacer(Modifier.width(8.dp))
            Button(onClick = onSave, enabled = !loading, modifier = if (compact) Modifier.weight(1.2f).height(48.dp) else Modifier.height(48.dp)) {
                Icon(Icons.Outlined.Save, null)
                Spacer(Modifier.width(6.dp))
                Text(if (loading) "Guardando…" else if (compact) "Guardar" else "Finalizar y guardar")
            }
        }
    }
}

@Composable
fun PrescriptionPreview(name: String, branch: String, medications: String, date: String) {
    ClinicCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Previsualización de receta", style = MaterialTheme.typography.titleMedium)
            Text("NaturaCare", style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
            Text("Medicina Natural, Biológica y Regenerativa", style = MaterialTheme.typography.labelMedium)
            Text("Sucursal $branch · ${date.ifBlank { "Fecha pendiente" }}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(8.dp))
            Text(name.ifBlank { "Paciente sin nombre" }, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
            Text("℞", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.primary, fontStyle = FontStyle.Italic)
            Text("Receta / indicaciones", style = MaterialTheme.typography.labelLarge)
            Text(medications.ifBlank { "Aún no se han ingresado indicaciones." }, style = MaterialTheme.typography.bodyLarge)
            Spacer(Modifier.height(80.dp))
            Text("Próxima cita: ____________________", style = MaterialTheme.typography.bodyMedium)
            Text("Firma y sello médico", modifier = Modifier.align(Alignment.End), style = MaterialTheme.typography.labelMedium)
        }
    }
}

fun applyDateMask(value: String): String {
    val digits = value.filter(Char::isDigit).take(8)
    return when {
        digits.length <= 2 -> digits
        digits.length <= 4 -> "${digits.take(2)}/${digits.drop(2)}"
        else -> "${digits.take(2)}/${digits.substring(2, 4)}/${digits.drop(4)}"
    }
}
