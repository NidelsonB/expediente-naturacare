package com.naturacare.clinic

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.naturacare.clinic.ui.AppViewModel
import com.naturacare.clinic.ui.AppViewModelFactory
import com.naturacare.clinic.ui.NaturaCareApp
import com.naturacare.clinic.ui.theme.NaturaCareTheme

class MainActivity : ComponentActivity() {
    private val viewModel: AppViewModel by viewModels {
        AppViewModelFactory((application as NaturaCareApplication).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val preferences = getSharedPreferences("naturacare_session", MODE_PRIVATE)
        viewModel.restoreSession(preferences.getBoolean("authenticated", false))
        setContent {
            NaturaCareTheme {
                NaturaCareApp(
                    viewModel = viewModel,
                    onSessionChanged = { authenticated ->
                        preferences.edit().putBoolean("authenticated", authenticated).apply()
                    },
                )
            }
        }
    }
}
