import struct
import sys

def read_aml(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    
    # Try finding the 3D LUT at the end of the file
    lut_size = 33
    expected_bytes = lut_size * lut_size * lut_size * 3 * 2 # 16-bit (2 bytes)
    offset = len(data) - expected_bytes
    
    if offset < 0:
        print("File too small!")
        return

    lut_data = data[offset:]
    
    # Try interpreting as 16-bit unsigned ints
    v_uint16 = struct.unpack(f'<{len(lut_data)//2}H', lut_data)
    
    print(f"File size: {len(data)}")
    print(f"Offset: {offset} (0x{offset:X})")
    
    print("First 5 RGB values (uint16):")
    for i in range(5):
        print(f"  [{i}]: {v_uint16[i*3]}, {v_uint16[i*3+1]}, {v_uint16[i*3+2]}")

if __name__ == '__main__':
    read_aml('Fuji_500T_Alt.aml')
