package com.naturacare.clinic.data

import kotlinx.serialization.Serializable

@Serializable
data class Patient(
    val id: String,
    val name: String,
    val gender: String,
    val age: Int,
    val dui: String? = null,
    val address: String,
    val chronicIllness: String = "",
    val medicalHistory: String = "",
    val branch: String = "San Marcos",
    val createdAt: String,
    val lastVisit: LastVisit? = null,
)

@Serializable
data class LastVisit(
    val id: String,
    val date: String,
    val treatment: String = "",
    val medications: String = "",
)

@Serializable
data class Visit(
    val id: String,
    val patientId: String,
    val date: String,
    val notes: List<String>,
    val treatment: String = "",
    val medications: String = "",
    val createdAt: String,
)

@Serializable
data class PaginatedPatients(
    val patients: List<Patient> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val limit: Int = 10,
)

@Serializable
data class PatientPayload(
    val id: String? = null,
    val name: String,
    val gender: String,
    val age: Int,
    val dui: String? = null,
    val address: String,
    val chronicIllness: String = "",
    val medicalHistory: String = "",
    val branch: String = "San Marcos",
    val createdAt: String? = null,
)

@Serializable
data class PatientUpdate(
    val name: String,
    val gender: String,
    val age: Int,
    val dui: String? = null,
    val address: String,
    val chronicIllness: String = "",
    val medicalHistory: String = "",
    val branch: String,
)

@Serializable
data class VisitPayload(
    val id: String,
    val patientId: String,
    val date: String,
    val notes: List<String>,
    val treatment: String,
    val medications: String,
    val createdAt: String,
)

@Serializable
data class VisitUpdate(val medications: String)

@Serializable
data class DuiCheck(val unique: Boolean)

data class PatientDraft(
    val name: String = "",
    val dui: String = "",
    val duiNotApplicable: Boolean = false,
    val age: String = "",
    val gender: String = "Masculino",
    val address: String = "",
    val chronicIllness: String = "",
    val medicalHistory: String = "",
    val branch: String = "San Marcos",
)

data class VisitDraft(
    val notes: List<String> = listOf(""),
    val treatment: String = "",
    val medications: String = "",
    val chronicIllness: String = "",
    val medicalHistory: String = "",
    val printDate: String = "",
)
