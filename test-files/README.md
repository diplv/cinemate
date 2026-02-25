# ALF4c Diagnostic Test Files

This directory contains diagnostic ALF4c files for troubleshooting the "black image" issue when loading converted looks in ARRI Reference Tool (ART).

## Debugging Summary

### What Was Verified as Correct

1. **CUBE axis ordering**: R-fastest convention (R changes fastest, B slowest) - confirmed working
2. **DRT data values**: Non-zero for typical image values
   - LogC4 0.625 (18% gray) outputs Rec.709 ~0.34 (expected for standard look)
   - 93% of LUT entries contain non-zero values
3. **Conversion math**: LogC4 to Linear to AWG3 to LogC3 pipeline produces correct values
4. **ALF4c file structure**: look-builder creates valid files (461KB for 33x33x33 LUT, 89KB for 17x17x17)
5. **Color space tagging**: CMT tagged as `AWG4/D65/LogC4`, SDR DRT tagged as `Rec.709/D65/BT.1886`

### Pipeline Mode

The active pipeline mode is `SCENARIO_B_FULL_CONVERTED_DRT`:
- CMT: Identity (17x17x17) - passes LogC4 values unchanged
- DRT: Fully converted (33x33x33) - bakes both AWG4 to AWG3 gamut AND LogC4 to LogC3 transfer into the DRT
- DRT expects AWG4/LogC4 input and outputs Rec.709

## Diagnostic Files

### 17x17x17 LUT Files (89 KB)

| File | Description | Expected Result |
|------|-------------|-----------------|
| `diag_solid_red.alf4c` | Constant (1,0,0) output | **SOLID RED** |
| `diag_50_gray.alf4c` | Constant (0.5,0.5,0.5) output | **50% GRAY** |
| `diag_gamma_lift.alf4c` | Sqrt gamma (brightening) | **BRIGHTER** than raw log |
| `diag_synthetic_17x17.alf4c` | Synthetic look resampled to 17x17x17 | Visible image with contrast |

### 33x33x33 LUT Files (461 KB)

| File | Description | Expected Result |
|------|-------------|-----------------|
| `diag_solid_red_33x33.alf4c` | Constant (1,0,0) at 33x33x33 size | **SOLID RED** |
| `diag_synthetic_look.alf4c` | Synthetic ARRI-style S-curve | Visible image with contrast |
| `converted_look.alf4c` | Actual converted look | Normal graded image |

### Known Issue

**The 33x33x33 files (`diag_synthetic_look.alf4c`, `converted_look.alf4c`) produce BLACK output.**

This suggests a potential issue with 33x33x33 LUT handling in ART or look-builder.

## How to Use These Files

### Test Procedure to Isolate LUT Size Issue

1. Open ART with ALEXA 35 footage, Custom Color Management mode
2. Test `diag_solid_red.alf4c` (17x17x17) - should show RED
3. Test `diag_solid_red_33x33.alf4c` (33x33x33) - should show RED
4. Compare results:

**If both show RED:** Issue is in our converted DRT data values
**If 17x17x17 shows RED but 33x33x33 shows BLACK:** Issue is with 33x33x33 LUT handling
**If both show BLACK:** Issue is in ART configuration

### Additional Tests

- `diag_synthetic_17x17.alf4c` - Same look as synthetic_look but at 17x17x17 size
- If 17x17x17 version works but 33x33x33 doesn't, the fix is to resample to 17x17x17

### Interpreting Results

**If `diag_solid_red.alf4c` shows SOLID RED:**
- The DRT slot IS being applied correctly
- Issue is in the specific converted DRT data or source LUT
- Try `diag_synthetic_look.alf4c` to verify a proper look works

**If `diag_solid_red.alf4c` shows BLACK:**
- The DRT slot is NOT being applied
- Check ART settings and Custom Color Management configuration
- Verify the ALF4c is loaded in the correct slot

**If `diag_solid_red.alf4c` shows the raw log image (washed out gray):**
- The DRT is being bypassed entirely
- Check if there's a "bypass DRT" or similar option enabled

## Technical Details

### LogC4 Value Mapping

| Scene Content | Linear Value | LogC4 Code | LUT Entry (33-size) |
|---------------|--------------|------------|---------------------|
| Black | 0.0 | 0.442 | ~14 |
| 18% Gray | 0.18 | 0.638 | ~20 |
| White | 1.0 | 0.803 | ~26 |

### Neutral Axis Output (Converted DRT)

For the `converted_look.alf4c`, the neutral axis (R=G=B) outputs:

| LogC4 Input | Rec.709 Output | Description |
|-------------|----------------|-------------|
| 0.000-0.375 | 0.00 | Below scene black (invalid) |
| 0.438 | ~0.02 | Scene black |
| 0.500 | ~0.07 | Dark shadows |
| 0.625 | ~0.34 | 18% gray |
| 0.750 | ~0.62 | Bright midtones |
| 1.000 | ~0.95 | Near white |

### Possible Remaining Issues

1. **ART Custom Color Management mode** may require specific settings
2. **CDL parameters** in the ALF4c could be affecting output (not set by our pipeline)
3. **Display/viewer settings** in ART may need configuration
4. **Footage characteristics** - ensure test footage is standard AWG4/LogC4

## File Generation

These files were generated using:
- `look-builder` from ARRI Reference Tool CMD v1.0.0
- Identity CMT (17x17x17) tagged as `AWG4/D65/LogC4`
- Various DRT configurations tagged as `Rec.709/D65/BT.1886` (SDR) and `Rec.2020/D65/PQ` (HDR)
