import { useEffect, useState } from "react";
import IRestaurante from "../../interfaces/IRestaurante";
import style from "./ListaRestaurantes.module.scss";
import Restaurante from "./Restaurante";
import axios from "axios";
import { IPaginacao } from "../../interfaces/IPaginacao";

const ListaRestaurantes = () => {
  const [restaurantes, setRestaurantes] = useState<IRestaurante[]>([]);
  const [restaurantesFiltrados, setRestaurantesFiltrados] = useState<
    IRestaurante[]
  >([]);
  const [searchValue, setSearchValue] = useState("");
  const [proximaPagina, setProximaPagina] = useState("");
  const [paginaAnterior, setPaginaAnterior] = useState("");

  const carregandoDados = (url: string) => {
    axios
      .get<IPaginacao<IRestaurante>>(url)
      .then((resposta) => {
        setRestaurantes(resposta.data.results);
        setRestaurantesFiltrados(resposta.data.results);
        setProximaPagina(resposta.data.next);
        setPaginaAnterior(resposta.data.previous);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  useEffect(() => {
    carregandoDados("http://localhost:8000/api/v1/restaurantes/");
  }, []);

  useEffect(() => {
    if (searchValue) {
      setRestaurantesFiltrados(
        restaurantes.filter((value) =>
          value.nome.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    } else {
      setRestaurantesFiltrados(restaurantes);
    }
  }, [searchValue, restaurantes]);

  return (
    <section className={style.ListaRestaurantes}>
      <h1>
        Os restaurantes mais <em>bacanas</em>!
      </h1>
      <input
        type="text"
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
        placeholder="Buscar restaurante"
      />
      {restaurantesFiltrados?.map((item) => (
        <Restaurante restaurante={item} key={item.id} />
      ))}
      {
        <button
          onClick={() => carregandoDados(paginaAnterior)}
          disabled={!paginaAnterior}
        >
          Página anterior
        </button>
      }
      {
        <button
          onClick={() => carregandoDados(proximaPagina)}
          disabled={!proximaPagina}
        >
          Próxima página
        </button>
      }
    </section>
  );
};

export default ListaRestaurantes;
