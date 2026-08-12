package com.naturacare.clinic.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.ArrowForward
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.naturacare.clinic.data.Patient
import com.naturacare.clinic.ui.AppUiState
import com.naturacare.clinic.ui.components.ClinicCard
import com.naturacare.clinic.ui.components.SectionHeader
import com.naturacare.clinic.ui.components.StatusChip
import com.naturacare.clinic.ui.components.formatClinicalDate
import kotlinx.coroutines.delay

@Composable
fun DashboardScreen(
    state: AppUiState,
    onSearch: (String, String, Int) -> Unit,
    onNewPatient: () -> Unit,
    onOpenPatient: (String) -> Unit,
    onSecretary: () -> Unit,
) {
    var query by remember { mutableStateOf("") }
    var mode by remember { mutableStateOf("name") }
    var page by remember { mutableIntStateOf(1) }
    var selectedId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(query, mode, page) {
        delay(300)
        onSearch(query, mode, page)
    }
    LaunchedEffect(state.searchResult.patients) {
        if (selectedId == null) selectedId = state.searchResult.patients.firstOrNull()?.id
    }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth < 600.dp
        val masterDetail = maxWidth >= 1000.dp
        Column(Modifier.fillMaxSize().padding(if (compact) 16.dp else 24.dp)) {
            if (compact) {
                Text("Expedientes", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold)
                Text(
                    "Busca y gestiona pacientes",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(16.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = onSecretary, modifier = Modifier.weight(1f).height(48.dp)) {
                        Icon(Icons.Outlined.Badge, null)
                        Spacer(Modifier.width(6.dp))
                        Text("Secretaría", maxLines = 1)
                    }
                    Button(onClick = onNewPatient, modifier = Modifier.weight(1f).height(48.dp)) {
                        Icon(Icons.Outlined.Add, null)
                        Spacer(Modifier.width(6.dp))
                        Text("Nuevo paciente", maxLines = 1)
                    }
                }
            } else {
                SectionHeader(
                    title = "Expedientes",
                    subtitle = "Busca y gestiona la información clínica de tus pacientes",
                    action = {
                        OutlinedButton(onClick = onSecretary, modifier = Modifier.height(48.dp)) {
                            Icon(Icons.Outlined.Badge, null)
                            Spacer(Modifier.width(8.dp))
                            Text("Registro de secretaría")
                        }
                        Spacer(Modifier.width(12.dp))
                        Button(onClick = onNewPatient, modifier = Modifier.height(48.dp)) {
                            Icon(Icons.Outlined.Add, null)
                            Spacer(Modifier.width(8.dp))
                            Text("Nuevo paciente")
                        }
                    },
                )
            }
            Spacer(Modifier.height(if (compact) 12.dp else 20.dp))
            if (compact) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = query,
                        onValueChange = { query = it; page = 1 },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text(if (mode == "name") "Buscar por nombre" else "Buscar por DUI") },
                        leadingIcon = { Icon(Icons.Outlined.Search, null) },
                        singleLine = true,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(selected = mode == "name", onClick = { mode = "name"; page = 1 }, label = { Text("Nombre") })
                        FilterChip(selected = mode == "dui", onClick = { mode = "dui"; page = 1 }, label = { Text("DUI") })
                    }
                }
            } else Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it; page = 1 },
                    modifier = Modifier.weight(1f),
                    label = { Text(if (mode == "name") "Buscar por nombre" else "Buscar por DUI") },
                    leadingIcon = { Icon(Icons.Outlined.Search, null) },
                    singleLine = true,
                )
                FilterChip(selected = mode == "name", onClick = { mode = "name"; page = 1 }, label = { Text("Nombre") })
                FilterChip(selected = mode == "dui", onClick = { mode = "dui"; page = 1 }, label = { Text("DUI") })
            }
            Spacer(Modifier.height(16.dp))

            if (masterDetail) {
                Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    PatientList(
                        patients = state.searchResult.patients,
                        selectedId = selectedId,
                        onSelect = { selectedId = it },
                        modifier = Modifier.weight(.9f).fillMaxHeight(),
                    )
                    PatientPreview(
                        patient = selectedId?.let(state.patientCache::get)
                            ?: state.searchResult.patients.firstOrNull { it.id == selectedId },
                        onOpen = onOpenPatient,
                        modifier = Modifier.weight(1.1f).fillMaxHeight(),
                    )
                }
            } else {
                PatientList(
                    patients = state.searchResult.patients,
                    selectedId = null,
                    onSelect = onOpenPatient,
                    modifier = Modifier.weight(1f),
                )
            }
            val pages = ((state.searchResult.total + 9) / 10).coerceAtLeast(1)
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = { if (page > 1) page-- }, enabled = page > 1) { Icon(Icons.Outlined.ArrowBack, "Página anterior") }
                Text(
                    if (compact) "$page / $pages · ${state.searchResult.total} pacientes"
                    else "Página $page de $pages · ${state.searchResult.total} pacientes",
                    style = MaterialTheme.typography.labelLarge,
                )
                IconButton(onClick = { if (page < pages) page++ }, enabled = page < pages) { Icon(Icons.Outlined.ArrowForward, "Página siguiente") }
            }
        }
    }
}

@Composable
private fun PatientList(
    patients: List<Patient>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    ClinicCard(modifier) {
        if (patients.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                Text("No se encontraron pacientes.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(Modifier.fillMaxSize()) {
                items(patients, key = Patient::id) { patient ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelect(patient.id) }
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(patient.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                            Text("${patient.age} años · ${patient.gender} · DUI ${patient.dui ?: "No aplica"}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Outlined.LocationOn, null, Modifier.size(15.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(patient.branch, style = MaterialTheme.typography.labelMedium)
                            }
                            if (patient.chronicIllness.isNotBlank()) {
                                StatusChip(patient.chronicIllness, MaterialTheme.colorScheme.error, Color.White)
                            }
                        }
                        if (patient.id == selectedId) {
                            Icon(Icons.Outlined.ChevronRight, null, tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PatientPreview(patient: Patient?, onOpen: (String) -> Unit, modifier: Modifier = Modifier) {
    ClinicCard(modifier) {
        if (patient == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Selecciona un paciente") }
            return@ClinicCard
        }
        Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(patient.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.SemiBold)
                    Text("${patient.age} años · ${patient.gender}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("DUI ${patient.dui ?: "No aplica"} · ${patient.branch}", style = MaterialTheme.typography.bodyMedium)
                }
                OutlinedButton(onClick = { onOpen(patient.id) }) { Text("Abrir expediente") }
            }
            if (patient.chronicIllness.isNotBlank()) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Alertas y condiciones", style = MaterialTheme.typography.titleMedium)
                    StatusChip(patient.chronicIllness, MaterialTheme.colorScheme.error, Color.White)
                }
            }
            ClinicCard(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Resumen de última consulta", style = MaterialTheme.typography.titleMedium)
                    val last = patient.lastVisit
                    if (last == null) {
                        Text("Sin consultas registradas", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    } else {
                        Text(formatClinicalDate(last.date), style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                        Text("Tratamiento", style = MaterialTheme.typography.labelMedium)
                        Text(last.treatment.ifBlank { "Sin tratamiento registrado" }, maxLines = 3, overflow = TextOverflow.Ellipsis)
                        Text("Receta", style = MaterialTheme.typography.labelMedium)
                        Text(last.medications.ifBlank { "Sin receta registrada" }, maxLines = 3, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    }
}
