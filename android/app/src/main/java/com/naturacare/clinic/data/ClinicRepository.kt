package com.naturacare.clinic.data

import java.time.Instant
import java.util.UUID

class ClinicRepository(private val api: NaturaCareApi) {
    suspend fun searchPatients(search: String, mode: String, page: Int) =
        api.searchPatients(search.trim(), mode, page)

    suspend fun patientsToday(): List<Patient> = api.getPatients()

    suspend fun visits(patientId: String): List<Visit> = api.getVisits(patientId)

    suspend fun createPatient(draft: PatientDraft): Patient {
        validatePatient(draft)
        val dui = draft.dui.takeUnless { draft.duiNotApplicable || it.isBlank() }
        if (dui != null && !api.checkDui(dui.trim()).unique) {
            error("El DUI ingresado ya existe. Verifica el número o marca No aplica.")
        }
        val now = Instant.now().toString()
        return api.createPatient(
            PatientPayload(
                id = UUID.randomUUID().toString(),
                name = draft.name.trim(),
                gender = draft.gender,
                age = draft.age.toInt(),
                dui = dui?.trim(),
                address = draft.address.trim(),
                chronicIllness = draft.chronicIllness.trim(),
                medicalHistory = draft.medicalHistory.trim(),
                branch = draft.branch,
                createdAt = now,
            )
        )
    }

    suspend fun createPatientWithVisit(patient: PatientDraft, visit: VisitDraft): Patient {
        require(visit.notes.any { it.isNotBlank() }) { "Ingresa al menos un motivo de consulta." }
        val created = createPatient(patient)
        createVisit(created.id, visit)
        return created
    }

    suspend fun updatePatient(id: String, draft: PatientDraft): Patient {
        validatePatient(draft)
        val dui = draft.dui.takeUnless { draft.duiNotApplicable || it.isBlank() }
        if (dui != null && !api.checkDui(dui.trim(), id).unique) {
            error("El DUI ingresado ya existe.")
        }
        return api.updatePatient(
            id,
            PatientUpdate(
                name = draft.name.trim(),
                gender = draft.gender,
                age = draft.age.toInt(),
                dui = dui?.trim(),
                address = draft.address.trim(),
                chronicIllness = draft.chronicIllness.trim(),
                medicalHistory = draft.medicalHistory.trim(),
                branch = draft.branch,
            )
        )
    }

    suspend fun createVisit(patientId: String, draft: VisitDraft): Visit {
        val notes = draft.notes.map(String::trim).filter(String::isNotEmpty)
        require(notes.isNotEmpty()) { "Ingresa al menos un motivo de consulta." }
        val now = Instant.now().toString()
        return api.createVisit(
            VisitPayload(
                id = UUID.randomUUID().toString(),
                patientId = patientId,
                date = now,
                notes = notes,
                treatment = draft.treatment.trim(),
                medications = draft.medications.trim(),
                createdAt = now,
            )
        )
    }

    suspend fun updateRecipe(visitId: String, medications: String): Visit {
        require(medications.isNotBlank()) { "La receta no puede quedar vacía." }
        return api.updateVisit(visitId, VisitUpdate(medications.trim()))
    }

    private fun validatePatient(draft: PatientDraft) {
        require(draft.name.isNotBlank()) { "Ingresa el nombre completo." }
        require(draft.address.isNotBlank()) { "Ingresa la dirección del paciente." }
        val age = draft.age.toIntOrNull()
        require(age != null && age in 1..150) { "Ingresa una edad válida entre 1 y 150 años." }
    }
}
