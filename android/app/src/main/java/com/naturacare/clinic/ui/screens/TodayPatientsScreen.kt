package com.naturacare.clinic.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.naturacare.clinic.data.Patient
import com.naturacare.clinic.ui.components.ClinicCard
import com.naturacare.clinic.ui.components.SectionHeader
import com.naturacare.clinic.ui.components.StatusChip
import com.naturacare.clinic.ui.components.formatClinicalDate
import com.naturacare.clinic.ui.components.isToday

@Composable
fun TodayPatientsScreen(
    patients: List<Patient>,
    loading: Boolean,
    onLoad: () -> Unit,
    onRegister: () -> Unit,
    onOpenPatient: (String) -> Unit,
) {
    LaunchedEffect(Unit) { onLoad() }
    val today = patients.filter { isToday(it.createdAt) }.sortedByDescending(Patient::createdAt)

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth < 600.dp
        Column(Modifier.fillMaxSize().padding(if (compact) 16.dp else 24.dp)) {
            if (compact) {
                Text("Pacientes de hoy", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold)
                Text(
                    "Panel de secretaría · ${today.size} registros",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(12.dp))
                Button(onClick = onRegister, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                    Icon(Icons.Outlined.Add, null)
                    Spacer(Modifier.padding(4.dp))
                    Text("Nuevo registro")
                }
            } else {
                SectionHeader(
                    title = "Pacientes de hoy",
                    subtitle = "Panel de secretaría · ${today.size} registros",
                    action = {
                        Button(onClick = onRegister, modifier = Modifier.height(48.dp)) {
                            Icon(Icons.Outlined.Add, null)
                            Spacer(Modifier.padding(4.dp))
                            Text("Nuevo registro")
                        }
                    },
                )
            }
            Spacer(Modifier.height(if (compact) 12.dp else 20.dp))
            ClinicCard(Modifier.fillMaxSize()) {
            if (today.isEmpty() && !loading) {
                Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Aún no hay pacientes registrados hoy.", style = MaterialTheme.typography.titleMedium)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = onRegister) { Text("Registrar paciente") }
                    }
                }
            } else {
                LazyColumn(Modifier.fillMaxSize()) {
                    items(today, key = Patient::id) { patient ->
                        if (compact) {
                            Column(
                                modifier = Modifier.fillMaxWidth().clickable { onOpenPatient(patient.id) }.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                Text(patient.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                                Text("DUI ${patient.dui ?: "No aplica"} · ${patient.age} años", color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("${patient.branch} · ${formatClinicalDate(patient.createdAt)}", style = MaterialTheme.typography.bodySmall)
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    StatusChip(
                                        "Pendiente de doctor",
                                        MaterialTheme.colorScheme.tertiaryContainer,
                                        MaterialTheme.colorScheme.onTertiaryContainer,
                                    )
                                    Icon(Icons.Outlined.ChevronRight, "Abrir expediente")
                                }
                            }
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth().clickable { onOpenPatient(patient.id) }.padding(18.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(16.dp),
                            ) {
                                Column(Modifier.weight(1.3f)) {
                                    Text(patient.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                                    Text("DUI ${patient.dui ?: "No aplica"} · ${patient.age} años", color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Column(Modifier.weight(1f)) {
                                    Text(patient.branch, fontWeight = FontWeight.Medium)
                                    Text(formatClinicalDate(patient.createdAt), style = MaterialTheme.typography.bodySmall)
                                }
                                StatusChip(
                                    "Pendiente de doctor",
                                    MaterialTheme.colorScheme.tertiaryContainer,
                                    MaterialTheme.colorScheme.onTertiaryContainer,
                                )
                                Icon(Icons.Outlined.ChevronRight, "Abrir expediente")
                            }
                        }
                    }
                }
            }
        }
        }
    }
}
