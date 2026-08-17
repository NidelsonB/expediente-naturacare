package com.naturacare.clinic.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface NaturaCareApi {
    @GET("patients/search")
    suspend fun searchPatients(
        @Query("search") search: String,
        @Query("mode") mode: String,
        @Query("page") page: Int,
        @Query("limit") limit: Int = 10,
    ): PaginatedPatients

    @GET("patients")
    suspend fun getPatients(): List<Patient>

    @GET("patients/check-dui")
    suspend fun checkDui(
        @Query("dui") dui: String,
        @Query("excludeId") excludeId: String? = null,
    ): DuiCheck

    @POST("patients")
    suspend fun createPatient(@Body patient: PatientPayload): Patient

    @PUT("patients/{id}")
    suspend fun updatePatient(@Path("id") id: String, @Body patient: PatientUpdate): Patient

    @DELETE("patients/{id}")
    suspend fun deletePatient(@Path("id") id: String)

    @GET("visits/patient/{patientId}")
    suspend fun getVisits(@Path("patientId") patientId: String): List<Visit>

    @POST("visits")
    suspend fun createVisit(@Body visit: VisitPayload): Visit

    @PUT("visits/{id}")
    suspend fun updateVisit(@Path("id") id: String, @Body visit: VisitUpdate): Visit
}
