package com.naturacare.clinic.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Save
import androidx.compose.material3.Button
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.naturacare.clinic.data.Patient
import com.naturacare.clinic.data.VisitDraft
import com.naturacare.clinic.ui.components.ClinicCard
import com.naturacare.clinic.ui.components.SectionHeader

@Composable
fun VisitFormScreen(
    patient: Patient?,
    loading: Boolean,
    onBack: () -> Unit,
    onSave: (VisitDraft) -> Unit,
) {
    if (patient == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Paciente no disponible", style = MaterialTheme.typography.headlineSmall)
                OutlinedButton(onClick = onBack) { Text("Regresar") }
            }
        }
        return
    }

    var visit by remember {
        mutableStateOf(
            VisitDraft(
                chronicIllness = patient.chronicIllness,
                medicalHistory = patient.medicalHistory,
            )
        )
    }
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val split = maxWidth >= 900.dp
        val compact = maxWidth < 600.dp
        Column(Modifier.fillMaxSize().imePadding()) {
            Row(
                Modifier.fillMaxWidth().padding(if (compact) 12.dp else 20.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) { Icon(Icons.Outlined.ArrowBack, "Regresar") }
                SectionHeader("Nueva consulta", patient.name, Modifier.weight(1f))
            }
            if (split) {
                Row(Modifier.weight(1f).padding(horizontal = 24.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    VisitEditor(visit, { visit = it }, Modifier.weight(1.15f).verticalScroll(rememberScrollState()))
                    Column(Modifier.weight(.85f).verticalScroll(rememberScrollState())) {
                        PrescriptionPreview(
                            patient.name,
                            patient.branch,
                            visit.medications,
                            visit.printDate,
                        )
                    }
                }
            } else {
                Column(
                    Modifier.weight(1f)
                        .padding(horizontal = if (compact) 12.dp else 16.dp)
                        .verticalScroll(rememberScrollState())
                ) {
                    VisitEditor(visit, { visit = it })
                    Spacer(Modifier.height(16.dp))
                    PrescriptionPreview(patient.name, patient.branch, visit.medications, visit.printDate)
                }
            }
            Row(
                Modifier.fillMaxWidth().padding(if (compact) 12.dp else 16.dp),
                horizontalArrangement = Arrangement.End,
            ) {
                OutlinedButton(
                    onClick = onBack,
                    modifier = Modifier.height(48.dp).then(if (compact) Modifier.weight(1f) else Modifier),
                ) { Text("Cancelar") }
                Spacer(Modifier.width(12.dp))
                Button(
                    onClick = { onSave(visit) },
                    enabled = !loading,
                    modifier = Modifier.height(48.dp).then(if (compact) Modifier.weight(1f) else Modifier),
                ) {
                    Icon(Icons.Outlined.Save, null)
                    Spacer(Modifier.width(6.dp))
                    Text(if (loading) "Guardando…" else if (compact) "Guardar" else "Guardar consulta")
                }
            }
        }
    }
}

@Composable
private fun VisitEditor(visit: VisitDraft, onChange: (VisitDraft) -> Unit, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        VisitFields(visit, onChange)
        ClinicCard(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Actualizar expediente", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                Text("Estos datos se conservarán en el perfil del paciente.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                OutlinedTextField(
                    value = visit.chronicIllness,
                    onValueChange = { onChange(visit.copy(chronicIllness = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Enfermedad crónica") },
                )
                OutlinedTextField(
                    value = visit.medicalHistory,
                    onValueChange = { onChange(visit.copy(medicalHistory = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Antecedentes clínicos") },
                    minLines = 3,
                )
            }
        }
    }
}
