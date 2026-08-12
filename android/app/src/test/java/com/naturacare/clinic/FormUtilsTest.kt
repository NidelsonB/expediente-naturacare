package com.naturacare.clinic

import com.naturacare.clinic.ui.screens.applyDateMask
import org.junit.Assert.assertEquals
import org.junit.Test

class FormUtilsTest {
    @Test
    fun dateMask_formatsEightDigits() {
        assertEquals("08/08/2026", applyDateMask("08082026"))
    }

    @Test
    fun dateMask_ignoresNonDigitsAndLimitsLength() {
        assertEquals("08/08/2026", applyDateMask("08-a08b-202699"))
    }

    @Test
    fun dateMask_keepsPartialInputEditable() {
        assertEquals("08/0", applyDateMask("080"))
    }
}
