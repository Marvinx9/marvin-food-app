import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ITag from "../../../interfaces/ITag";
import http from "../../../http";
import IRestaurante from "../../../interfaces/IRestaurante";
import { useParams } from "react-router-dom";
import IPrato from "../../../interfaces/IPrato";

const FormularioPrato = () => {
  const parametros = useParams();

  const [nomePrato, setNomePrato] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<ITag[]>([]);
  const [restaurantes, setRestaurantes] = useState<IRestaurante[]>([]);
  const [restaurante, setRestaurante] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);

  useEffect(() => {
    http
      .get<{ tags: ITag[] }>("v2/tags/")
      .then((resposta) => setTags(resposta.data.tags));
    http
      .get<IRestaurante[]>("v2/restaurantes/")
      .then((resposta) => setRestaurantes(resposta.data));
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resRestaurantes] = await Promise.all([
          http.get<IRestaurante[]>("v2/restaurantes/"),
        ]);

        setRestaurantes(resRestaurantes.data);

        if (parametros.id) {
          const resPrato = await http.get<IPrato>(
            `v2/pratos/${parametros.id}/`
          );
          setNomePrato(resPrato.data.nome);
          setDescricao(resPrato.data.descricao);
          setTag(resPrato.data.tag);

          const restauranteSelecionado = resRestaurantes.data.find(
            (r) => r.id === resPrato.data.restaurante
          );
          setRestaurante(
            restauranteSelecionado ? restauranteSelecionado.id.toString() : ""
          );
        }
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      }
    };

    carregarDados();
  }, [parametros.id]);
  const selecionarArquivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files?.length) {
      setImagem(evento.target.files[0]);
    } else {
      setImagem(null);
    }
  };

  const aoSubmeterForm = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const formData = new FormData();

    formData.append("nome", nomePrato);
    formData.append("descricao", descricao);
    formData.append("tag", tag);
    formData.append("restaurante", restaurante);

    if (imagem) {
      formData.append("imagem", imagem);
    }

    if (parametros.id) {
      http
        .request({
          url: `v2/pratos/${parametros.id}/`,
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        })
        .then(() => {
          alert("Prato atualizado com sucesso!");
        });
    } else {
      http
        .request({
          url: "v2/pratos/",
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        })
        .then(() => {
          setNomePrato("");
          setRestaurante("");
          setTag("");
          setDescricao("");
          alert("prato cadastrado com sucesso!");
        })
        .catch((error) => alert(error.message));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexGrow: 1,
      }}
    >
      <Typography component="h1" variant="h6">
        Formulário de Pratos
      </Typography>
      <Box component="form" sx={{ width: "100%" }} onSubmit={aoSubmeterForm}>
        <TextField
          value={nomePrato}
          onChange={(evento) => setNomePrato(evento.target.value)}
          label="Nome do Prato"
          variant="standard"
          fullWidth
          required
          margin="dense"
        />
        <TextField
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
          label="Descrição do Prato"
          variant="standard"
          fullWidth
          required
          margin="dense"
        />

        <FormControl margin="dense" fullWidth>
          <InputLabel id="select-tag">Tag</InputLabel>
          <Select
            labelId="select-tag"
            value={tag}
            onChange={(evento) => setTag(evento.target.value)}
          >
            {tags.map((tag) => (
              <MenuItem key={tag.id} value={tag.value}>
                {tag.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl margin="dense" fullWidth>
          <InputLabel id="select-restaurante">Restaurante</InputLabel>
          <Select
            labelId="select-restaurante"
            value={restaurante}
            onChange={(evento) => setRestaurante(evento.target.value)}
          >
            {restaurantes.map((restaurante) => (
              <MenuItem key={restaurante.id} value={restaurante.id}>
                {restaurante.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <input type="file" onChange={selecionarArquivo}></input>
        <Button
          sx={{ marginTop: 1 }}
          type="submit"
          fullWidth
          variant="outlined"
        >
          Salvar
        </Button>
      </Box>
    </Box>
  );
};

export default FormularioPrato;
