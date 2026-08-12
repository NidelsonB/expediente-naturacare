package com.naturacare.clinic

import android.app.Application
import com.naturacare.clinic.data.ClinicRepository
import com.naturacare.clinic.data.NaturaCareApi
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

class NaturaCareApplication : Application() {
    lateinit var repository: ClinicRepository
        private set

    override fun onCreate() {
        super.onCreate()
        // Explicit nulls let the API clear an existing optional DUI when the user selects "No aplica".
        val json = Json { ignoreUnknownKeys = true; explicitNulls = true }
        val client = OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC else HttpLoggingInterceptor.Level.NONE
            })
            .build()
        val api = Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(NaturaCareApi::class.java)
        repository = ClinicRepository(api)
    }
}
