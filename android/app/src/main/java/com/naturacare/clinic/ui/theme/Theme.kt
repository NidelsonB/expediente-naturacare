package com.naturacare.clinic.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

val NaturaPrimary = Color(0xFF005344)
val NaturaPrimaryContainer = Color(0xFF006D5B)
val NaturaSecondary = Color(0xFF005FAF)
val NaturaAmber = Color(0xFF7B5B00)
val NaturaError = Color(0xFFBA1A1A)
val NaturaBackground = Color(0xFFF8F9FA)
val NaturaSurface = Color(0xFFFFFFFF)
val NaturaOutline = Color(0xFFBEC9C4)
val NaturaText = Color(0xFF191C1D)

private val NaturaColors = lightColorScheme(
    primary = NaturaPrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF9DF3DC),
    onPrimaryContainer = Color(0xFF00201A),
    secondary = NaturaSecondary,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD4E3FF),
    onSecondaryContainer = Color(0xFF001C3A),
    tertiary = NaturaAmber,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFDFA0),
    onTertiaryContainer = Color(0xFF261A00),
    error = NaturaError,
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF93000A),
    background = NaturaBackground,
    onBackground = NaturaText,
    surface = NaturaSurface,
    onSurface = NaturaText,
    surfaceVariant = Color(0xFFE1E3E4),
    onSurfaceVariant = Color(0xFF3E4945),
    outline = Color(0xFF6E7975),
    outlineVariant = NaturaOutline,
)

private val NaturaShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(6.dp),
    medium = RoundedCornerShape(8.dp),
    large = RoundedCornerShape(12.dp),
    extraLarge = RoundedCornerShape(16.dp),
)

@Composable
fun NaturaCareTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = NaturaColors,
        typography = MaterialTheme.typography,
        shapes = NaturaShapes,
        content = content,
    )
}
