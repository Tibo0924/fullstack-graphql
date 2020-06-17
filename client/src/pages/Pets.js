import React, { useState } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import PetsList from "../components/PetsList";
import NewPetModal from "../components/NewPetModal";
import Loader from "../components/Loader";

const PET_FIELDS = gql`
  fragment Petsfields on Pet {
    id
    name
    type
    img
    vaccinated @client
    owner {
      id
      age @client
    }
  }
`;

const ALL_PETS = gql`
  query Allpets {
    pets {
      ...Petsfields
    }
  }
  ${PET_FIELDS}
`;

const NEW_PET = gql`
  mutation CreateAPet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      ...Petsfields
    }
  }
  ${PET_FIELDS}
`;

export default function Pets() {
  const [modal, setModal] = useState(false);
  const { data, loading, error } = useQuery(ALL_PETS);
  const [createPet, newPet] = useMutation(NEW_PET, {
    update(cache, { data: { addPet } }) {
      const data = cache.readQuery({ query: ALL_PETS });
      cache.writeQuery({
        query: ALL_PETS,
        data: { pets: [addPet, ...data.pets] },
      });
    },
  });

  const onSubmit = (input) => {
    setModal(false);
    createPet({
      variables: { newPet: input },
      optimisticResponse: {
        __typename: "Mutation",
        addPet: {
          __typename: "Pet",
          id: Math.floor(Math.random() * 1000) + "",
          name: input.name,
          type: input.type,
          img: "https://via.placeholder.com/300",
        },
      },
    });
  };

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />;
  }

  if (loading) {
    return <Loader />;
  }
  if (error) {
    return error;
  }

  return (
    <div className='page pets-page'>
      <section>
        <div className='row betwee-xs middle-xs'>
          <div className='col-xs-10'>
            <h1>Pets</h1>
          </div>

          <div className='col-xs-2'>
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets} />
      </section>
    </div>
  );
}
