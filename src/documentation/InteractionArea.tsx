/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Box,
  Heading,
  Grid,
  GridItem,
  Checkbox,
  Center,
} from '@chakra-ui/react'
import { FormattedMessage } from "react-intl";
import InteractionDocumentation from "./interaction/InteractionDocumentation";
import Spinner from "../common/Spinner";
import { useDocumentation } from "./documentation-hooks";
import { useState } from "react";
import HeadedScrollablePanel from "./../common/HeadedScrollablePanel";


const InteractionArea = () => {
  
    const [sliderValue1, setSliderValue1] = useState(128)
  
    const labelStyles1 = {
      mt: '2',
      ml: '-2.5',
      fontSize: 'sm',
    }

    const [sliderValue2, setSliderValue2] = useState(128)
  
    const labelStyles2 = {
      mt: '2',
      ml: '-2.5',
      fontSize: 'sm',
    }

    const [sliderValue3, setSliderValue3] = useState(2500)
  
    const labelStyles3 = {
      mt: '2',
      ml: '-2.5',
      fontSize: 'sm',
    }

    const [sliderValue4, setSliderValue4] = useState(2500)
  
    const labelStyles4 = {
      mt: '2',
      ml: '-2.5',
      fontSize: 'sm',
    }

    return (
      <HeadedScrollablePanel>
      <Box m={7}>
        <Heading>Interaction</Heading>
        <Text p={5} >
          <FormattedMessage id="Start Frequency" />
        </Text>
        <Slider aria-label='slider-ex-6' onChange={(val) => setSliderValue3(val)} max={5000}>
        <SliderMark value={150} {...labelStyles1}> 
          0 
        </SliderMark>
        <SliderMark value={2500} {...labelStyles1}>
          2500
        </SliderMark>
        <SliderMark value={4800} {...labelStyles1}>
          5000
        </SliderMark>
        <SliderMark
          value={sliderValue3}
          textAlign='center'
          bg='blue.500'
          color='white'
          mt='-10'
          ml='-5'
          w='12'
        >
          {sliderValue3}
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
        <Text p={5}>
          <FormattedMessage id="End Frequency" />
        </Text>
        <Slider aria-label='slider-ex-6' onChange={(val) => setSliderValue4(val)} max={5000}>
        <SliderMark value={150} {...labelStyles1}> 
          0 
        </SliderMark>
        <SliderMark value={2500} {...labelStyles1}>
          2500
        </SliderMark>
        <SliderMark value={4800} {...labelStyles1}>
          5000
        </SliderMark>
        <SliderMark
          value={sliderValue4}
          textAlign='center'
          bg='blue.500'
          color='white'
          mt='-10'
          ml='-5'
          w='12'
        >
          {sliderValue4}
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
        <Text p={5}>
          <FormattedMessage id = "Duration" />
        </Text>
        <NumberInput min={1} max={9999} keepWithinRange = {false} clampValueOnBlur={false}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Text p={5}>
          <FormattedMessage id="Start Volume" />
        </Text>  
      <Slider aria-label='slider-ex-6' onChange={(val) => setSliderValue1(val)} max={255}>
        <SliderMark value={10} {...labelStyles1}>
          0
        </SliderMark>
        <SliderMark value={128} {...labelStyles1}>
          128
        </SliderMark>
        <SliderMark value={245} {...labelStyles1}>
          255
        </SliderMark>
        <SliderMark
          value={sliderValue1}
          textAlign='center'
          bg='blue.500'
          color='white'
          mt='-10'
          ml='-5'
          w='12'
        >
          {sliderValue1}
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Text p={5}>
          <FormattedMessage id="End Volume" />
        </Text>  
        <Slider aria-label='slider-ex-6' onChange={(val) => setSliderValue2(val)} max={255}>
        <SliderMark value={10} {...labelStyles1}> 
          0 
        </SliderMark>
        <SliderMark value={128} {...labelStyles1}>
          128
        </SliderMark>
        <SliderMark value={245} {...labelStyles1}>
          255
        </SliderMark>
        <SliderMark
          value={sliderValue2}
          textAlign='center'
          bg='blue.500'
          color='white'
          mt='-10'
          ml='-5'
          w='12'
        >
          {sliderValue2}
        </SliderMark>
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Text p={5}>
        <FormattedMessage id="Waveform" />
      </Text>  
      <Select placeholder='Select option'>
        <option value='option1'>Sine</option>
        <option value='option2'>Sawtooth</option>
        <option value='option3'>Triangle</option>
        <option value='option4'>Square</option>
        <option value='option5'>Noise</option>
      </Select>
      <Text p={5}>
        <FormattedMessage id="Effect" />
      </Text>
      <Select placeholder='None'>
        <option value='option1'>Tremolo</option>
        <option value='option2'>Vibrato</option>
        <option value='option3'>Warble</option>
      </Select>
      <Text p={5}>
        <FormattedMessage id="Shape" />
      </Text>
      <Select placeholder='Select option'>
        <option value='option1'>Linear</option>
        <option value='option2'>Curve</option>
        <option value='option3'>Log</option>
      </Select>
      <Text p={5}>
        <FormattedMessage id="Pixels" />
      </Text>
      <Box m ={4} borderWidth='20px' borderRadius='lg' borderColor={'black'} bg='black'>
      <Grid templateColumns='repeat(5, 1fr)' gap={6}>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
        <GridItem w='100%' h='10'>
          <Center><Checkbox size = 'lg' colorScheme='red'></Checkbox></Center>
        </GridItem>
      </Grid>
      </Box>
      </Box>
      </HeadedScrollablePanel>
      
    )
    
};

export default InteractionArea;
