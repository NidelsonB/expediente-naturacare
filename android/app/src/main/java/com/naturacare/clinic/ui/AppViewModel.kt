package com.naturacare.clinic.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.naturacare.clinic.data.ClinicRepository
import com.naturacare.clinic.data.PaginatedPatients
import com.naturacare.clinic.data.Patient
import com.naturacare.clinic.data.PatientDraft
import com.naturacare.clinic.data.Visit
import com.naturacare.clinic.data.VisitDraft
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.IOException

data class AppUiState(
    val authenticated: Boolean = false,
    val loading: Boolean = false,
    val searchResult: PaginatedPatients = PaginatedPatients(),
    val todayPatients: List<Patient> = emptyList(),
    val patientCache: Map<String, Patient> = emptyMap(),
    val visits: Map<String, List<Visit>> = emptyMap(),
    val error: String? = null,
    val notice: String? = null,
)

class AppViewModel(private val repository: ClinicRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(AppUiState())
    val uiState: StateFlow<AppUiState> = _uiState.asStateFlow()

    fun restoreSession(authenticated: Boolean) {
        _uiState.value = _uiState.value.copy(authenticated = authenticated)
    }

    fun login(username: String, password: String): Boolean {
        val valid = username.trim() == "selvin" && password == "Natura0922"
        _uiState.value = if (valid) {
            _uiState.value.copy(authenticated = true, error = null)
        } else {
            _uiState.value.copy(error = "Usuario o contraseña incorrectos.")
        }
        return valid
    }

    fun logout() {
        _uiState.value = AppUiState()
    }

    fun search(search: String, mode: String, page: Int) = launchRequest {
        val result = repository.searchPatients(search, mode, page)
        _uiState.value = _uiState.value.copy(
            searchResult = result,
            patientCache = _uiState.value.patientCache + result.patients.associateBy(Patient::id),
        )
    }

    fun loadToday() = launchRequest {
        val patients = repository.patientsToday()
        _uiState.value = _uiState.value.copy(
            todayPatients = patients,
            patientCache = _uiState.value.patientCache + patients.associateBy(Patient::id),
        )
    }

    fun loadVisits(patientId: String) = launchRequest {
        val result = repository.visits(patientId)
        _uiState.value = _uiState.value.copy(visits = _uiState.value.visits + (patientId to result))
    }

    fun registerSecretary(draft: PatientDraft, onSuccess: (Patient) -> Unit) = launchRequest {
        val patient = repository.createPatient(draft)
        cachePatient(patient)
        _uiState.value = _uiState.value.copy(notice = "Paciente registrado. Pendiente de doctor.")
        onSuccess(patient)
    }

    fun createPatient(draft: PatientDraft, visit: VisitDraft, onSuccess: (Patient) -> Unit) = launchRequest {
        val patient = repository.createPatientWithVisit(draft, visit)
        cachePatient(patient)
        _uiState.value = _uiState.value.copy(notice = "Paciente y consulta guardados correctamente.")
        onSuccess(patient)
    }

    fun updatePatient(id: String, draft: PatientDraft, onSuccess: (Patient) -> Unit) = launchRequest {
        val patient = repository.updatePatient(id, draft)
        cachePatient(patient)
        _uiState.value = _uiState.value.copy(notice = "Datos del paciente actualizados.")
        onSuccess(patient)
    }

    fun addVisit(patient: Patient, draft: VisitDraft, onSuccess: (Visit) -> Unit) = launchRequest {
        val visit = repository.createVisit(patient.id, draft)
        var updatedPatient = patient
        if (draft.chronicIllness.isNotBlank() || draft.medicalHistory.isNotBlank()) {
            updatedPatient = repository.updatePatient(
                patient.id,
                PatientDraft(
                    name = patient.name,
                    dui = patient.dui.orEmpty(),
                    duiNotApplicable = patient.dui.isNullOrBlank(),
                    age = patient.age.toString(),
                    gender = patient.gender,
                    address = patient.address,
                    chronicIllness = draft.chronicIllness.ifBlank { patient.chronicIllness },
                    medicalHistory = draft.medicalHistory.ifBlank { patient.medicalHistory },
                    branch = patient.branch,
                )
            )
            cachePatient(updatedPatient)
        }
        val current = _uiState.value.visits[patient.id].orEmpty()
        _uiState.value = _uiState.value.copy(
            visits = _uiState.value.visits + (patient.id to (listOf(visit) + current)),
            notice = "Consulta guardada correctamente.",
        )
        onSuccess(visit)
    }

    fun updateRecipe(patientId: String, visitId: String, medications: String) = launchRequest {
        val updated = repository.updateRecipe(visitId, medications)
        val current = _uiState.value.visits[patientId].orEmpty()
        _uiState.value = _uiState.value.copy(
            visits = _uiState.value.visits + (patientId to current.map { if (it.id == visitId) updated else it }),
            notice = "Receta actualizada.",
        )
    }

    fun clearMessage() {
        _uiState.value = _uiState.value.copy(error = null, notice = null)
    }

    private fun cachePatient(patient: Patient) {
        _uiState.value = _uiState.value.copy(patientCache = _uiState.value.patientCache + (patient.id to patient))
    }

    private fun launchRequest(block: suspend () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loading = true, error = null)
            try {
                block()
            } catch (error: Throwable) {
                val message = when (error) {
                    is IOException -> "No se pudo conectar con el servidor. Revisa la red y la URL de NaturaCare."
                    else -> error.message ?: "No se pudo completar la acción."
                }
                _uiState.value = _uiState.value.copy(error = message)
            } finally {
                _uiState.value = _uiState.value.copy(loading = false)
            }
        }
    }
}

class AppViewModelFactory(private val repository: ClinicRepository) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T = AppViewModel(repository) as T
}
