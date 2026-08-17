package com.naturacare.clinic.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.FolderShared
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.People
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.naturacare.clinic.ui.screens.DashboardScreen
import com.naturacare.clinic.ui.screens.LoginScreen
import com.naturacare.clinic.ui.screens.NewPatientScreen
import com.naturacare.clinic.ui.screens.PatientDetailScreen
import com.naturacare.clinic.ui.screens.SecretaryFormScreen
import com.naturacare.clinic.ui.screens.TodayPatientsScreen
import com.naturacare.clinic.ui.screens.VisitFormScreen

private data class Destination(val route: String, val label: String, val icon: ImageVector)

private val primaryDestinations = listOf(
    Destination("dashboard", "Expedientes", Icons.Outlined.FolderShared),
    Destination("secretary", "Secretaría", Icons.Outlined.PersonAdd),
    Destination("today", "Hoy", Icons.Outlined.People),
)

@Composable
fun NaturaCareApp(viewModel: AppViewModel, onSessionChanged: (Boolean) -> Unit) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val navController = rememberNavController()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(state.error, state.notice) {
        val message = state.error ?: state.notice
        if (message != null) {
            snackbar.showSnackbar(message)
            viewModel.clearMessage()
        }
    }

    if (!state.authenticated) {
        LoginScreen(
            error = state.error,
            onLogin = { username, password ->
                if (viewModel.login(username, password)) onSessionChanged(true)
            },
        )
        return
    }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val useRail = maxWidth >= 700.dp
        val backStack by navController.currentBackStackEntryAsState()
        val currentDestination = backStack?.destination
        val navigate: (String) -> Unit = { route ->
            navController.navigate(route) {
                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                launchSingleTop = true
                restoreState = true
            }
        }

        Scaffold(
            snackbarHost = { SnackbarHost(snackbar) },
            bottomBar = {
                if (!useRail) {
                    NavigationBar {
                        primaryDestinations.forEach { item ->
                            NavigationBarItem(
                                selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                                onClick = { navigate(item.route) },
                                icon = { Icon(item.icon, contentDescription = null) },
                                label = { Text(item.label) },
                            )
                        }
                    }
                }
            },
        ) { padding ->
            Row(Modifier.fillMaxSize().padding(padding)) {
                if (useRail) {
                    NavigationRail {
                        primaryDestinations.forEach { item ->
                            NavigationRailItem(
                                selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                                onClick = { navigate(item.route) },
                                icon = { Icon(item.icon, contentDescription = null) },
                                label = { Text(item.label) },
                            )
                        }
                        NavigationRailItem(
                            selected = false,
                            onClick = {
                                viewModel.logout()
                                onSessionChanged(false)
                            },
                            icon = { Icon(Icons.Outlined.Logout, contentDescription = null) },
                            label = { Text("Salir") },
                        )
                    }
                }

                Box(Modifier.fillMaxSize()) {
                    NavHost(navController, startDestination = "dashboard") {
                        composable("dashboard") {
                            DashboardScreen(
                                state = state,
                                onSearch = viewModel::search,
                                onNewPatient = { navController.navigate("patient/new") },
                                onOpenPatient = { navController.navigate("patient/$it") },
                                onSecretary = { navigate("secretary") },
                            )
                        }
                        composable("secretary") {
                            SecretaryFormScreen(
                                loading = state.loading,
                                onSave = { draft -> viewModel.registerSecretary(draft) { navigate("today") } },
                                onToday = { navigate("today") },
                            )
                        }
                        composable("today") {
                            TodayPatientsScreen(
                                patients = state.todayPatients,
                                loading = state.loading,
                                onLoad = viewModel::loadToday,
                                onRegister = { navigate("secretary") },
                                onOpenPatient = { navController.navigate("patient/$it") },
                            )
                        }
                        composable("patient/new") {
                            NewPatientScreen(
                                loading = state.loading,
                                onCancel = { navController.popBackStack() },
                                onSave = { patient, visit ->
                                    viewModel.createPatient(patient, visit) {
                                        navController.navigate("patient/${it.id}") {
                                            popUpTo("patient/new") { inclusive = true }
                                        }
                                    }
                                },
                            )
                        }
                        composable("patient/{patientId}") { entry ->
                            val id = entry.arguments?.getString("patientId").orEmpty()
                            PatientDetailScreen(
                                patient = state.patientCache[id],
                                visits = state.visits[id].orEmpty(),
                                loading = state.loading,
                                onLoadVisits = { viewModel.loadVisits(id) },
                                onBack = { navController.popBackStack() },
                                onNewVisit = { navController.navigate("patient/$id/visit") },
                                onUpdatePatient = { draft, done -> viewModel.updatePatient(id, draft) { done() } },
                                onDeletePatient = { viewModel.deletePatient(id) { navController.popBackStack() } },
                                onUpdateRecipe = { visitId, medication -> viewModel.updateRecipe(id, visitId, medication) },
                            )
                        }
                        composable("patient/{patientId}/visit") { entry ->
                            val id = entry.arguments?.getString("patientId").orEmpty()
                            val patient = state.patientCache[id]
                            VisitFormScreen(
                                patient = patient,
                                loading = state.loading,
                                onBack = { navController.popBackStack() },
                                onSave = { draft ->
                                    if (patient != null) viewModel.addVisit(patient, draft) { navController.popBackStack() }
                                },
                            )
                        }
                    }

                    if (state.loading) {
                        CircularProgressIndicator(
                            modifier = Modifier.align(Alignment.TopEnd).padding(20.dp),
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }
        }
    }
}
